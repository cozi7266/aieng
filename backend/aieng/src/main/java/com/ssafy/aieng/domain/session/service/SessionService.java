package com.ssafy.aieng.domain.session.service;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.aieng.domain.child.entity.Child;
import com.ssafy.aieng.domain.child.repository.ChildRepository;
import com.ssafy.aieng.domain.child.service.ChildService;
import com.ssafy.aieng.domain.learning.entity.Learning;
import com.ssafy.aieng.domain.session.dto.response.CreateSessionResponse;
import com.ssafy.aieng.domain.session.dto.response.SessionResponse;
import com.ssafy.aieng.domain.session.entity.Session;
import com.ssafy.aieng.domain.learning.repository.LearningRepository;
import com.ssafy.aieng.domain.session.repository.SessionRepository;
import com.ssafy.aieng.domain.theme.entity.Theme;
import com.ssafy.aieng.domain.theme.repository.ThemeRepository;
import com.ssafy.aieng.domain.user.repository.UserRepository;
import com.ssafy.aieng.domain.word.dto.response.WordResponse;
import com.ssafy.aieng.domain.word.entity.Word;
import com.ssafy.aieng.domain.word.repository.WordRepository;
import com.ssafy.aieng.global.common.CustomPage;
import com.ssafy.aieng.global.common.redis.service.RedisService;
import com.ssafy.aieng.global.common.util.RedisKeyUtil;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionService {

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

    // 사용자와 아이 인증
    private Child getVerifiedChild(Integer userId, Integer childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));
        if (!child.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }
        return child;
    }

    @Transactional
    public CreateSessionResponse createLearningSession(Integer userId, Integer childId, Integer themeId) {
        // 1. 아이 소유자 검증
        Child child = getVerifiedChild(userId, childId);

        // 2. 테마 확인
        Theme theme = themeRepository.findById(themeId)
                .orElseThrow(() -> new CustomException(ErrorCode.THEME_NOT_FOUND));

        // 3. 기존 진행 중인 세션 조회
        Optional<Session> existingSessionOpt = sessionRepository
                .findByChildIdAndThemeIdAndFinishedAtIsNull(childId, themeId);

        if (existingSessionOpt.isPresent()) {
            Session existing = existingSessionOpt.get();
            List<WordResponse> words = learningRepository.findAllBySessionIdAndDeletedFalse(existing.getId()).stream()
                    .sorted(Comparator.comparing(Learning::getPageOrder))
                    .map(WordResponse::of)
                    .toList();
            return new CreateSessionResponse(existing.getId(), false, words);
        }

        // 4. 세션 생성
        Session session = Session.of(child, theme);
        sessionRepository.save(session);

        // 5. 랜덤 단어 6개 선택
        List<Word> wordList = wordRepository.findAllByThemeId(themeId);
        Collections.shuffle(wordList);
        List<Word> selectedWords = wordList.stream().limit(6).toList();

        // 6. Learning 엔티티 생성 및 저장
        List<Learning> learningBatch = new ArrayList<>();
        for (int i = 0; i < selectedWords.size(); i++) {
            Word word = selectedWords.get(i);
            Learning learning = Learning.builder()
                    .session(session)
                    .word(word)
                    .pageOrder(i + 1)
                    .learned(false)
                    .build();
            learningBatch.add(learning);
        }
        learningRepository.saveAll(learningBatch);
        session.setTotalWordCount(learningBatch.size());

        // 7. Redis 저장 (순서)
        String orderKey = String.format("session:%d:wordOrder", session.getId());
        List<String> wordIds = learningBatch.stream()
                .map(l -> l.getWord().getId().toString())
                .toList();
        stringRedisTemplate.opsForList().rightPushAll(orderKey, wordIds);
        stringRedisTemplate.expire(orderKey, Duration.ofDays(1));

        // 8. Redis 저장 (각 단어 정보)
        for (Learning learning : learningBatch) {
            Word word = learning.getWord();

            // Redis Key: Learning:user:{userId}:session:{sessionId}:word:{wordEn}
            String infoKey = RedisKeyUtil.getGeneratedContentKey(userId, session.getId(), word.getWordEn());

            Map<String, String> wordInfo = Map.of(
                    "wordEn", word.getWordEn(),
                    "wordKo", word.getWordKo(),
                    "imgUrl", word.getImgUrl()
            );
            stringRedisTemplate.opsForHash().putAll(infoKey, wordInfo);
            stringRedisTemplate.expire(infoKey, Duration.ofDays(1));
        }

        // 9. 응답용 변환
        List<WordResponse> wordResponses = selectedWords.stream()
                .map(WordResponse::of)
                .toList();

        return new CreateSessionResponse(session.getId(), true, wordResponses);
    }



    //  특정 학습 세션 조회
    public SessionResponse getSessionById(Integer sessionId, Integer userId) {
        Session session = sessionRepository.findByIdAndDeletedFalse(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.SESSION_NOT_FOUND));
        getVerifiedChild(userId, session.getChild().getId());
        return SessionResponse.of(session);
    }

    // 자녀의 세션 목록 조회 (정렬 필드도 유연하게 처리 가능)
    public CustomPage<SessionResponse> getSessionsByChildPaged(
            Integer userId, Integer childId, int page, int size
    ) {
        // 1. 아이 소유자 검증
        Child child = getVerifiedChild(userId, childId);

        // 2. 페이징 및 정렬 (기본 정렬: 테마 ID → createdAt)
        PageRequest pageRequest = PageRequest.of(
                page - 1,
                size,
                Sort.by(
                        Sort.Order.asc("theme.id"),      // 테마 순 정렬
                        Sort.Order.desc("createdAt")     // 생성일 순 정렬
                )
        );

        // 3. DB 조회
        Page<Session> sessionPage = sessionRepository.findAllByChildIdAndDeletedFalse(childId, pageRequest);

        // 4. DTO 변환
        Page<SessionResponse> dtoPage = sessionPage.map(SessionResponse::of);

        return new CustomPage<>(dtoPage);
    }


    // 학습 세션 삭제 (Soft Delete 적용)
    @Transactional
    public void softDeleteSession(Integer sessionId, Integer userId) {
        Session session = sessionRepository.findByIdAndDeletedFalse(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.SESSION_NOT_FOUND));

        // 유저가 이 세션의 아이 부모인지 확인
        getVerifiedChild(userId, session.getChild().getId());

        // Learning soft delete
        if (session.getLearnings() != null) {
            for (Learning learning : session.getLearnings()) {
                if (!learning.isAlreadyDeleted()) {
                    learning.softDelete();
                }
            }
        }

        // Session soft delete
        if (!session.isAlreadyDeleted()) {
            session.softDelete();
        }
    }

}
