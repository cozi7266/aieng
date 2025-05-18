package com.ssafy.aieng.domain.learning.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.ssafy.aieng.domain.child.entity.Child;
import com.ssafy.aieng.domain.child.repository.ChildRepository;
import com.ssafy.aieng.domain.child.service.ChildService;
import com.ssafy.aieng.domain.learning.dto.request.GenerateContentRequest;
import com.ssafy.aieng.domain.learning.dto.response.GeneratedContentResult;
import com.ssafy.aieng.domain.learning.dto.response.LearningSessionDetailResponse;
import com.ssafy.aieng.domain.learning.dto.response.SentenceResponse;
import com.ssafy.aieng.domain.learning.entity.Learning;
import com.ssafy.aieng.domain.session.entity.Session;
import com.ssafy.aieng.domain.learning.repository.LearningRepository;
import com.ssafy.aieng.domain.session.repository.SessionRepository;
import com.ssafy.aieng.domain.theme.repository.ThemeRepository;
import com.ssafy.aieng.domain.user.repository.UserRepository;
import com.ssafy.aieng.domain.word.entity.Word;
import com.ssafy.aieng.domain.word.repository.WordRepository;
import com.ssafy.aieng.global.common.redis.service.RedisService;
import com.ssafy.aieng.global.common.util.RedisKeyUtil;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Comparator;


import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class LearningService {

    private final UserRepository userRepository;
    private final RedisService redisService;
    private final LearningRepository learningRepository;
    private final SessionRepository sessionRepository;
    private final ChildService childService;
    private final ThemeRepository themeRepository;
    private final WordRepository wordRepository;
    private final ChildRepository childRepository;
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    private static final Duration REDIS_TTL = Duration.ofHours(24);

    // 유저, 아이 검증
    private void validateChildOwnership(Integer userId, Integer childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));
        if (!child.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }
    }

    // 한 세션에 단어 목록 조회 (랜덤 6개 조회)
    @Transactional(readOnly = true)
    public LearningSessionDetailResponse getLearningSessionDetail(Integer userId, Integer childId, Integer sessionId) {
        Session session = sessionRepository.findByIdAndDeletedFalse(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.SESSION_NOT_FOUND));

        if (!session.getChild().getUser().getId().equals(userId)
                || !session.getChild().getId().equals(childId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        List<Learning> learnings = learningRepository.findAllBySessionIdAndDeletedFalse(sessionId);
        return LearningSessionDetailResponse.of(session, learnings);
    }


    /**
     * FastAPI에 단어 생성 요청 전송 (문장, 이미지, TTS)
     * - Redis에 결과가 저장되기를 기다리지 않음
     * - 프론트에서 이후 polling으로 결과 조회
     */

    @Transactional(readOnly = true)
    public void sendFastApiRequest(Integer userId, Integer childId, Integer sessionId, String wordEn) {
        validateChildOwnership(userId, childId);

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.SESSION_NOT_FOUND));
        String themeKo = session.getTheme().getThemeKo();

        Word wordEntity = wordRepository.findByWordEn(wordEn)
                .orElseThrow(() -> new CustomException(ErrorCode.WORD_NOT_FOUND));

        GenerateContentRequest request = GenerateContentRequest.builder()
                .userId(userId)
                .sessionId(sessionId)
                .theme(themeKo)
                .wordEn(wordEn)
                .build();

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<GenerateContentRequest> entity = new HttpEntity<>(request, headers);

            restTemplate.postForEntity(
                    "https://www.aieng.co.kr/fastapi/words/",
                    entity,
                    String.class
            );

            log.info("📤 FastAPI 요청 전송 완료: userId={}, sessionId={}, word={}", userId, sessionId, wordEn);
        } catch (Exception e) {
            log.error("❌ FastAPI 요청 실패: sessionId={}, word={}", sessionId, wordEn, e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }



    /**
     * Redis에서 생성 결과를 조회하고, Learning 테이블에 저장
     * - 이미 저장된 경우 중복 저장 생략
     * - 프론트에서 /generate/result 호출 시 자동으로 저장됨
     */
    @Transactional
    public GeneratedContentResult sendRequestAndSave(Integer userId, Integer childId, Integer sessionId, String wordEn) {
        validateChildOwnership(userId, childId);

        // FastAPI 요청 보내기
        sendFastApiRequest(userId, childId, sessionId, wordEn);

        // Redis polling
        String key = RedisKeyUtil.getGeneratedContentKey(userId, sessionId, wordEn);
        String json = null;

        int retry = 0;
        while (retry < 10) {
            json = stringRedisTemplate.opsForValue().get(key);
            if (json != null) break;
            try {
                Thread.sleep(500); // 0.5초 대기 후 재시도
            } catch (InterruptedException ignored) {}
            retry++;
        }

        if (json == null) throw new CustomException(ErrorCode.RESOURCE_NOT_FOUND);

        GeneratedContentResult result;
        try {
            objectMapper.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
            result = objectMapper.readValue(json, GeneratedContentResult.class);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        // DB 저장 처리
        Session session = sessionRepository.findByIdAndDeletedFalse(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.SESSION_NOT_FOUND));
        Word wordEntity = wordRepository.findByWordEn(wordEn)
                .orElseThrow(() -> new CustomException(ErrorCode.WORD_NOT_FOUND));
        Learning learning = learningRepository.findBySessionIdAndWordId(sessionId, wordEntity.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.LEARNING_NOT_FOUND));

        try {
            if (!learning.isLearned()) {
                learning.updateContent(result);
                learningRepository.save(learning);
                session.incrementLearnedCount();

                if (session.getLearnedWordCount().equals(session.getTotalWordCount())) {
                    session.finish();
                    log.info("🎉 세션 종료 처리됨: sessionId={}, finishedAt={}", session.getId(), session.getFinishedAt());
                }
            }
        } catch (ObjectOptimisticLockingFailureException e) {
            log.warn("🔄 중복 저장 방지: 이미 저장된 Learning 데이터 - sessionId={}, word={}", sessionId, wordEn);
        }

        log.info("✅ 학습 완료 후 진행률: sessionId={}, learned={}, rate={}",
                session.getId(), session.getLearnedWordCount(), session.getProgressRate());

        return result;
    }


    // 생성한 문장 관련 정보 조회
    @Transactional(readOnly = true)
    public SentenceResponse getSentenceResponse(Integer userId, Integer childId, Integer sessionId, String wordEn) {
        // 1️⃣ 자녀 소유자 검증
        validateChildOwnership(userId, childId);

        // 2️⃣ 단어 엔티티 조회
        Word word = wordRepository.findByWordEn(wordEn)
                .orElseThrow(() -> new CustomException(ErrorCode.WORD_NOT_FOUND));

        // 3️⃣ 학습 기록 조회
        Learning learning = learningRepository.findBySessionIdAndWordId(sessionId, word.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.LEARNING_NOT_FOUND));

        // 4️⃣ 학습 정보 유효성 검사
        if (learning.getSentence() == null || learning.getImgUrl() == null || learning.getTtsUrl() == null) {
            throw new CustomException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        // 5️⃣ 응답 반환
        return SentenceResponse.of(learning);
    }


}
