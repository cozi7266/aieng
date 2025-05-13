package com.ssafy.aieng.domain.learning.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.ssafy.aieng.domain.child.entity.Child;
import com.ssafy.aieng.domain.child.repository.ChildRepository;
import com.ssafy.aieng.domain.child.service.ChildService;
import com.ssafy.aieng.domain.learning.dto.request.GenerateContentRequest;
import com.ssafy.aieng.domain.learning.dto.response.GeneratedContentResult;
import com.ssafy.aieng.domain.learning.dto.response.LearningWordResponse;
import com.ssafy.aieng.domain.learning.dto.response.SentenceResponse;
import com.ssafy.aieng.domain.learning.dto.response.ThemeProgressResponse;
import com.ssafy.aieng.domain.learning.entity.Learning;
import com.ssafy.aieng.domain.learning.entity.Session;
import com.ssafy.aieng.domain.learning.repository.LearningRepository;
import com.ssafy.aieng.domain.learning.repository.SessionRepository;
import com.ssafy.aieng.domain.theme.entity.Theme;
import com.ssafy.aieng.domain.theme.repository.ThemeRepository;
import com.ssafy.aieng.domain.user.entity.User;
import com.ssafy.aieng.domain.user.repository.UserRepository;
import com.ssafy.aieng.domain.voice.entity.Voice;
import com.ssafy.aieng.domain.word.entity.Word;
import com.ssafy.aieng.domain.word.repository.WordRepository;
import com.ssafy.aieng.global.common.CustomPage;
import com.ssafy.aieng.global.common.redis.service.RedisService;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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

    //  테마별 진행률 조회
    public CustomPage<ThemeProgressResponse> getThemeProgressByChildIdForParent(Integer childId, Integer parentId, Pageable pageable) {
        childService.validateChildOwnership(childId, parentId);
        String cacheKey = "themeProgress:" + childId + ":page:" + pageable.getPageNumber();

        List<ThemeProgressResponse> cached = redisService.getList(cacheKey, ThemeProgressResponse.class);
        if (cached != null) {
            return new CustomPage<>(new PageImpl<>(cached, pageable, cached.size()));
        }

        Page<ThemeProgressResponse> result = learningRepository.findThemeProgressByChildId(childId, pageable);
        redisService.save(cacheKey, result.getContent(), 3600);

        return new CustomPage<>(result);
    }

    //  아이가 테마에 진입할 때: 단어 랜덤 생성 및 학습 상태 유지
    @Transactional
    public CustomPage<LearningWordResponse> getOrCreateLearningSession(Integer childId, Integer themeId, Integer userId, Pageable pageable) {
        List<Word> words = wordRepository.findAllByThemeId(themeId);

        // 1. Session 조회 (없으면 생성)
        Session session = sessionRepository.findByChildIdAndThemeId(childId, themeId)
                .orElseGet(() -> {
                    Child child = childRepository.findById(childId)
                            .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));

                    Theme theme = themeRepository.findById(themeId)
                            .orElseThrow(() -> new CustomException(ErrorCode.THEME_NOT_FOUND));

                    Session newSession = Session.of(child, theme);
                    sessionRepository.save(newSession);

                    List<Learning> learnings = words.stream()
                            .map(word -> Learning.of(newSession, word))
                            .toList();

                    learningRepository.saveAll(learnings);

                    newSession.setWordCount(learnings.size());

                    return newSession;
                });

        // 2. 해당 세션의 학습 단어 목록 페이징 조회
        Page<Learning> page = learningRepository.findAllBySessionId(session.getId(), pageable);

        List<LearningWordResponse> dtoList = page.getContent().stream()
                .map(LearningWordResponse::of)
                .toList();

        return new CustomPage<>(new PageImpl<>(dtoList, pageable, page.getTotalElements()));
    }


    @Transactional
    public GeneratedContentResult generateAndSaveWordContent(Integer userId, GenerateContentRequest request) {
        log.info("📥 [요청 시작] generateAndSaveWordContent - userId: {}, sessionId: {}, word: {}", userId, request.getSessionId(), request.getWord());

        // 1. FastAPI 호출
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<GenerateContentRequest> entity = new HttpEntity<>(request, headers);

            log.info("📡 FastAPI 요청 전송: {}", entity.getBody());
            var response = restTemplate.postForEntity("https://www.aieng.co.kr/fastapi/words/", entity, String.class);
            log.info("📬 FastAPI 응답 상태 코드: {}, Body: {}", response.getStatusCode(), response.getBody());
        } catch (Exception e) {
            log.error("❌ FastAPI 호출 실패: {}", e.getMessage(), e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        // 2. Redis 결과 polling (최대 10초 동안 0.5초 간격)
        String redisKey = String.format("word:%d:%d:%s", request.getUserId(), request.getSessionId(), request.getWord());

        log.debug("🔍 Redis 키 생성됨: {}", redisKey);

        String redisJson = null;
        int maxRetry = 20;

        for (int i = 0; i < maxRetry; i++) {
            redisJson = stringRedisTemplate.opsForValue().get(redisKey);
            if (redisJson != null) {
                log.info("📦 Redis 값 발견 ({}회 시도): {}", i + 1, redisJson);
                break;
            }
            log.debug("⏳ Redis에 아직 값 없음 ({}회 시도)", i + 1);
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
            }
        }

        if (redisJson == null) {
            log.warn("⚠️ Redis에서 결과를 찾지 못함: {}", redisKey);
            throw new CustomException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        // 3. JSON → DTO 파싱
        GeneratedContentResult result;
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
            result = objectMapper.readValue(redisJson, GeneratedContentResult.class);
            log.info("✅ Redis 파싱 성공 - 단어: {}, 문장: {}", result.getWord(), result.getSentence());
        } catch (Exception e) {
            log.error("❌ Redis JSON 파싱 실패: {}", e.getMessage(), e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        // 4. RDB 업데이트
        Session session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new CustomException(ErrorCode.SESSION_NOT_FOUND));
        Word word = wordRepository.findById(request.getWordId())
                .orElseThrow(() -> new CustomException(ErrorCode.LEARNING_NOT_FOUND));

        Learning learning = learningRepository.findBySessionIdAndWordId(session.getId(), word.getId())
                .orElse(null);
        if (learning == null) {
            log.info("🆕 학습 엔티티가 없어 새로 생성합니다.");
            learning = Learning.of(session, word);
        }

        learning.updateContent(result);
        learningRepository.save(learning);
        log.info("📝 학습 데이터 저장 완료 - wordId: {}, sentence: {}", word.getId(), result.getSentence());

        return result;
    }

    // 아이가 생성한 문장의 tts 듣기
    @Transactional(readOnly = true)
    public String getSentenceAudioUrl(Integer userId, Integer childId, Integer wordId) {
        String redisKey = String.format("word:%d:%d:%d:tts", userId, childId, wordId);
        String ttsUrl = stringRedisTemplate.opsForValue().get(redisKey);

        if (ttsUrl != null) {
            log.info("📦 Redis hit - key: {}, url: {}", redisKey, ttsUrl);
            return ttsUrl;
        }

        // Redis에 없으면 RDB에서 조회
        Session session = sessionRepository.findTopByChildIdOrderByCreatedAtDesc(childId)
                .orElseThrow(() -> new CustomException(ErrorCode.SESSION_NOT_FOUND));

        Learning learning = learningRepository.findBySessionIdAndWordId(session.getId(), wordId)
                .orElseThrow(() -> new CustomException(ErrorCode.LEARNING_NOT_FOUND));

        if (learning.getTtsUrl() == null) {
            throw new CustomException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        ttsUrl = learning.getTtsUrl();

        // Redis에 캐싱 (선택적으로 만료 시간 설정 가능)
        stringRedisTemplate.opsForValue().set(redisKey, ttsUrl);
        log.info("💾 Redis 저장 - key: {}, url: {}", redisKey, ttsUrl);

        return ttsUrl;
    }

    // 아이가 생성한 문장의 이미지 URL 조회
    @Transactional(readOnly = true)
    public String getSentenceImg(Integer userId, Integer childId, Integer wordId) {
        // 최근 세션 조회
        Session session = sessionRepository.findTopByChildIdOrderByCreatedAtDesc(childId)
                .orElseThrow(() -> new CustomException(ErrorCode.SESSION_NOT_FOUND));

        Integer sessionId = session.getId();
        String redisKey = String.format("word:%d:%d", sessionId, wordId);

        // Redis에서 조회
        String imgUrl = stringRedisTemplate.opsForValue().get(redisKey);
        if (imgUrl != null) {
            log.info("🖼️ Redis hit - key: {}, url: {}", redisKey, imgUrl);
            return imgUrl;
        }

        // Redis에 없으면 DB에서 조회
        Learning learning = learningRepository.findBySessionIdAndWordId(sessionId, wordId)
                .orElseThrow(() -> new CustomException(ErrorCode.LEARNING_NOT_FOUND));

        if (learning.getImgUrl() == null) {
            throw new CustomException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        imgUrl = learning.getImgUrl();

        // Redis에 저장
        stringRedisTemplate.opsForValue().set(redisKey, imgUrl);
        log.info("💾 Redis 저장 - key: {}, url: {}", redisKey, imgUrl);

        return imgUrl;
    }

    // 생헌한 문장 관련 정보 조회
    @Transactional(readOnly = true)
    public SentenceResponse getSentenceResponse(Integer userId, Integer childId, Integer wordId) {
        // 1. 세션 조회
        Session session = sessionRepository.findTopByChildIdOrderByCreatedAtDesc(childId)
                .orElseThrow(() -> new CustomException(ErrorCode.SESSION_NOT_FOUND));
        Integer sessionId = session.getId();

        // 2. DB에서 학습 정보 먼저 가져와 단어명 확보 (키 구성에 필요)
        Learning learning = learningRepository.findBySessionIdAndWordId(sessionId, wordId)
                .orElseThrow(() -> new CustomException(ErrorCode.LEARNING_NOT_FOUND));
        Word word = learning.getWord();
        String wordEn = word.getWordEn();

        // 3. Redis 키 구성
        String redisKey = String.format("word:%d:%d:%s", sessionId, wordId, wordEn);

        // 4. Redis 조회
        String cachedJson = stringRedisTemplate.opsForValue().get(redisKey);
        if (cachedJson != null) {
            try {
                Map<String, String> cached = objectMapper.readValue(cachedJson, new TypeReference<>() {});
                log.info("✅ Redis hit - key: {}", redisKey);

                return new SentenceResponse(
                        cached.get("wordEn"),
                        cached.get("sentence"),
                        cached.get("image_url"),
                        cached.get("audio_url")
                );
            } catch (Exception e) {
                log.warn("❌ Redis 파싱 실패 - key: {}, 이유: {}", redisKey, e.getMessage());
            }
        }

        // 5. 데이터 유효성 검사
        if (learning.getSentence() == null || learning.getImgUrl() == null || learning.getTtsUrl() == null) {
            throw new CustomException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        // 6. Redis에 캐싱
        Map<String, String> cache = new HashMap<>();
        cache.put("wordEn", word.getWordEn());
        cache.put("sentence", learning.getSentence());
        cache.put("image_url", learning.getImgUrl());
        cache.put("audio_url", learning.getTtsUrl());

        try {
            String jsonValue = objectMapper.writeValueAsString(cache);
            stringRedisTemplate.opsForValue().set(redisKey, jsonValue);
            log.info("💾 Redis 저장 완료 - key: {}", redisKey);
        } catch (Exception e) {
            log.warn("❌ Redis 저장 실패 - key: {}, 이유: {}", redisKey, e.getMessage());
        }

        return new SentenceResponse(
                word.getWordEn(),
                learning.getSentence(),
                learning.getImgUrl(),
                learning.getTtsUrl()
        );
    }

    // 1. 학습 진행 Redis 저장
    public void saveProgressToRedis(Integer userId, Integer childId, Integer wordId) {
        Session session = sessionRepository.findTopByChildIdOrderByCreatedAtDesc(childId)
                .orElseThrow(() -> new CustomException(ErrorCode.SESSION_NOT_FOUND));

        Integer sessionId = session.getId();
        Word word = wordRepository.findById(wordId)
                .orElseThrow(() -> new CustomException(ErrorCode.WORD_NOT_FOUND));

        // 예시값 (실제로는 프론트에서 받아온 GeneratedContentResult 등 사용)
        Map<String, String> value = new HashMap<>();
        value.put("sentence", "I see a robot");
        value.put("ttsUrl", "https://example.com/robot.mp3");
        value.put("imgUrl", "https://example.com/robot.jpg");
        value.put("learned", "true");
        value.put("learnedAt", LocalDateTime.now().toString());

        String key = String.format("word:%d:%d:%s", sessionId, wordId, word.getWordEn());

        try {
            stringRedisTemplate.opsForValue().set(key, objectMapper.writeValueAsString(value));
            log.info("✅ Redis 저장 완료: {}", key);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    // 2. Redis -> DB 반영
    @Transactional
    public void persistProgressFromRedis(Integer userId, Integer childId, Integer sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.SESSION_NOT_FOUND));

        List<Word> words = wordRepository.findAll();
        for (Word word : words) {
            String key = String.format("word:%d:%d:%s", sessionId, word.getId(), word.getWordEn());
            String json = stringRedisTemplate.opsForValue().get(key);
            if (json == null) continue;

            try {
                Map<String, String> data = objectMapper.readValue(json, new TypeReference<>() {
                });

                Learning learning = Learning.builder()
                        .session(session)
                        .word(word)
                        .sentence(data.get("sentence"))
                        .ttsUrl(data.get("ttsUrl"))
                        .imgUrl(data.get("imgUrl"))
                        .learned(Boolean.parseBoolean(data.get("learned")))
                        .learnedAt(LocalDateTime.parse(data.get("learnedAt")))
                        .build();

                learningRepository.save(learning);

            } catch (Exception e) {
                log.error("❌ Redis → DB 저장 실패: key={}, 이유={}", key, e.getMessage());
            }
        }
    }

}
