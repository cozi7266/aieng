package com.ssafy.aieng.domain.session.service;


import com.ssafy.aieng.domain.child.entity.Child;
import com.ssafy.aieng.domain.child.repository.ChildRepository;
import com.ssafy.aieng.domain.learning.entity.Learning;
import com.ssafy.aieng.domain.session.dto.response.ChildThemeProgressResponse;
import com.ssafy.aieng.domain.session.dto.response.CreateSessionResponse;
import com.ssafy.aieng.domain.session.entity.Session;
import com.ssafy.aieng.domain.learning.repository.LearningRepository;
import com.ssafy.aieng.domain.session.repository.SessionRepository;
import com.ssafy.aieng.domain.theme.entity.Theme;
import com.ssafy.aieng.domain.theme.repository.ThemeRepository;
import com.ssafy.aieng.domain.word.dto.response.WordResponse;
import com.ssafy.aieng.domain.word.entity.Word;
import com.ssafy.aieng.domain.word.repository.WordRepository;
import com.ssafy.aieng.global.common.util.RedisKeyUtil;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionService {

    private final LearningRepository learningRepository;
    private final SessionRepository sessionRepository;
    private final ThemeRepository themeRepository;
    private final WordRepository wordRepository;
    private final ChildRepository childRepository;
    private final StringRedisTemplate stringRedisTemplate;

    // 사용자와 아이 인증
    private Child getVerifiedChild(Integer userId, Integer childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));
        if (!child.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }
        return child;
    }


    // 학습 세션 생성
    @Transactional
    public CreateSessionResponse createLearningSession(Integer userId, Integer childId, Integer themeId) {
        // 1. 아이 소유자 검증
        Child child = getVerifiedChild(userId, childId);

        // 2. 테마 확인
        Theme theme = themeRepository.findById(themeId)
                .orElseThrow(() -> new CustomException(ErrorCode.THEME_NOT_FOUND));

        // 3. 기존 진행 중인 세션들 조회 (내림차순 정렬됨)
        List<Session> sessions = sessionRepository.findSessionsByChildAndThemeOrdered(childId, themeId);

        if (!sessions.isEmpty()) {
            Session existing = sessions.get(0);
            List<WordResponse> words = learningRepository.findAllBySessionIdAndDeletedFalse(existing.getId()).stream()
                    .sorted(Comparator.comparing(Learning::getPageOrder))
                    .map(WordResponse::of)
                    .toList();
            return new CreateSessionResponse(existing.getId(), false, theme.getThemeEn(), theme.getThemeKo(), words);
        }


        // 4. 세션 생성
        Session session = Session.of(child, theme);
        sessionRepository.save(session);

        // 5. 랜덤 단어 6개 선택
        List<Word> wordList = wordRepository.findAllByThemeId(themeId);
        if (wordList.size() < 6) {
            throw new CustomException(ErrorCode.NOT_ENOUGH_WORDS);
        }
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

        // 7. Redis 저장 (단어별 정보만)
        for (Learning learning : learningBatch) {
            Word word = learning.getWord();
            String infoKey = RedisKeyUtil.getGeneratedContentKey(userId, session.getId(), word.getWordEn());

            Map<String, String> wordInfo = new HashMap<>();
            if (word.getWordEn() != null) wordInfo.put("wordEn", word.getWordEn());
            if (word.getWordKo() != null) wordInfo.put("wordKo", word.getWordKo());
            if (word.getImgUrl() != null) wordInfo.put("imgUrl", word.getImgUrl());

            stringRedisTemplate.opsForHash().putAll(infoKey, wordInfo);
            stringRedisTemplate.expire(infoKey, Duration.ofDays(1));
        }

        // 8. 응답용 변환
        List<WordResponse> wordResponses = learningBatch.stream()
                .map(learning -> WordResponse.of(learning.getWord(), learning))
                .toList();

        return new CreateSessionResponse(session.getId(), true, theme.getThemeEn(), theme.getThemeKo(), wordResponses);
    }


    // 기존 세션에서 단어만 다시 랜덤하게 섞기
    @Transactional
    public CreateSessionResponse reshuffleWords(Integer userId, Integer childId, Integer themeId, Integer sessionId) {
        // 1. 세션 조회 + 검증
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.SESSION_NOT_FOUND));

        if (!session.getChild().getId().equals(childId) || !session.getTheme().getId().equals(themeId) || session.getFinishedAt() != null) {
            throw new CustomException(ErrorCode.INVALID_SESSION_ACCESS);
        }

        // 2. 기존 Learning 하드 delete + Redis 삭제
        List<Learning> oldLearnings = learningRepository.findAllBySessionIdAndDeletedFalse(sessionId);
        for (Learning learning : oldLearnings) {
            String infoKey = RedisKeyUtil.getGeneratedContentKey(userId, sessionId, learning.getWord().getWordEn());
            stringRedisTemplate.delete(infoKey);
        }
        learningRepository.deleteAll(oldLearnings); // ← 실제 삭제

        // 3. 새 단어 6개 선택
        List<Word> wordList = wordRepository.findAllByThemeId(themeId);
        if (wordList.size() < 6) {
            throw new CustomException(ErrorCode.NOT_ENOUGH_WORDS);
        }
        Collections.shuffle(wordList);
        List<Word> selectedWords = wordList.stream().limit(6).toList();

        // 4. 새로운 Learning 저장
        List<Learning> newLearnings = new ArrayList<>();
        for (int i = 0; i < selectedWords.size(); i++) {
            Word word = selectedWords.get(i);
            Learning learning = Learning.builder()
                    .session(session)
                    .word(word)
                    .pageOrder(i + 1)
                    .learned(false)
                    .build();
            newLearnings.add(learning);
        }
        learningRepository.saveAll(newLearnings);

        // 5. Redis 재등록
        for (Learning learning : newLearnings) {
            Word word = learning.getWord();
            String infoKey = RedisKeyUtil.getGeneratedContentKey(userId, sessionId, word.getWordEn());

            Map<String, String> wordInfo = new HashMap<>();
            if (word.getWordEn() != null) wordInfo.put("wordEn", word.getWordEn());
            if (word.getWordKo() != null) wordInfo.put("wordKo", word.getWordKo());
            if (word.getImgUrl() != null) wordInfo.put("imgUrl", word.getImgUrl());

            stringRedisTemplate.opsForHash().putAll(infoKey, wordInfo);
            stringRedisTemplate.expire(infoKey, Duration.ofDays(1));
        }

        // 6. 응답 반환
        List<WordResponse> wordResponses = newLearnings.stream()
                .map(l -> WordResponse.of(l.getWord(), l))
                .toList();

        return new CreateSessionResponse(
                sessionId,
                false,
                session.getTheme().getThemeEn(),
                session.getTheme().getThemeKo(),
                wordResponses
        );
    }



    // 자녀의 세션 목록 조회 (정렬 필드도 유연하게 처리 가능)
    public List<ChildThemeProgressResponse> getAllThemesWithProgress(Integer userId, Integer childId) {
        getVerifiedChild(userId, childId);

        List<Theme> allThemes = themeRepository.findAll();
        List<Session> sessions = sessionRepository.findAllByChildIdAndDeletedFalse(childId);

        // 테마별 최신 세션만 남기기
        Map<Integer, Session> themeSessionMap = sessions.stream()
                .collect(Collectors.toMap(
                        s -> s.getTheme().getId(),
                        s -> s,
                        (s1, s2) -> s1.getStartedAt().isAfter(s2.getStartedAt()) ? s1 : s2
                ));

        // 각 테마에 대해 DTO 생성
        return allThemes.stream()
                .map(theme -> {
                    Session session = themeSessionMap.get(theme.getId());
                    return (session != null)
                            ? ChildThemeProgressResponse.fromSession(session)
                            : ChildThemeProgressResponse.fromThemeOnly(theme);
                })
                .toList();
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

    public ChildThemeProgressResponse getThemeProgress(Integer userId, Integer childId, Integer themeId) {
        getVerifiedChild(userId, childId);

        Theme theme = themeRepository.findById(themeId)
                .orElseThrow(() -> new CustomException(ErrorCode.THEME_NOT_FOUND));

        return sessionRepository
                .findTopByChildIdAndThemeIdAndDeletedFalseOrderByStartedAtDesc(childId, themeId)
                .map(ChildThemeProgressResponse::fromSession)
                .orElseGet(() -> ChildThemeProgressResponse.fromThemeOnly(theme));
    }


}
