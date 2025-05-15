package com.ssafy.aieng.domain.session.service;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.aieng.domain.child.entity.Child;
import com.ssafy.aieng.domain.child.repository.ChildRepository;
import com.ssafy.aieng.domain.child.service.ChildService;
import com.ssafy.aieng.domain.learning.entity.Learning;
import com.ssafy.aieng.domain.session.dto.response.SessionResponse;
import com.ssafy.aieng.domain.session.entity.Session;
import com.ssafy.aieng.domain.session.entity.SessionGroup;
import com.ssafy.aieng.domain.learning.repository.LearningRepository;
import com.ssafy.aieng.domain.session.repository.SessionGroupRepository;
import com.ssafy.aieng.domain.session.repository.SessionRepository;
import com.ssafy.aieng.domain.theme.entity.Theme;
import com.ssafy.aieng.domain.theme.repository.ThemeRepository;
import com.ssafy.aieng.domain.user.repository.UserRepository;
import com.ssafy.aieng.domain.word.dto.response.WordResponse;
import com.ssafy.aieng.domain.word.entity.Word;
import com.ssafy.aieng.domain.word.repository.WordRepository;
import com.ssafy.aieng.global.common.CustomPage;
import com.ssafy.aieng.global.common.redis.service.RedisService;
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
    private final SessionGroupRepository sessionGroupRepository;
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

    // 클라이언트가 테마 클릭 시 단어 순서 저장 (RDB, Redis)
    @Transactional
    public Integer createLearningSession(Integer userId, Integer childId, Integer themeId) {
        // 1️. 아이 소유자 검증
        Child child = getVerifiedChild(userId, childId);

        // 2. 테마 확인
        Theme theme = themeRepository.findById(themeId)
                .orElseThrow(() -> new CustomException(ErrorCode.THEME_NOT_FOUND));

        // 3. 기존 세션 존재 여부 확인
        Optional<Session> existingSessionOpt = sessionRepository.findByChildIdAndThemeId(childId, themeId);
        if (existingSessionOpt.isPresent()) {
            return existingSessionOpt.get().getId(); // 기존 세션 ID 반환
        }

        //  이후부터는 "정말로 새로운 세션"일 때만 실행됨

        // 4. 세션 생성
        Session session = Session.of(child, theme);
        sessionRepository.save(session);

        // 5️. 단어 셔플 및 그룹 묶기
        List<Word> wordList = wordRepository.findAllByThemeId(themeId);
        Collections.shuffle(wordList);

        int pageOrder = 1, groupOrder = 1;
        List<Learning> learningBatch = new ArrayList<>();

        for (int i = 0; i < wordList.size(); i += 6) {
            List<Word> groupWords = wordList.subList(i, Math.min(i + 6, wordList.size()));

            SessionGroup group = SessionGroup.builder()
                    .session(session)
                    .groupOrder(groupOrder++)
                    .completed(false)
                    .totalWordCount(groupWords.size())
                    .learnedWordCount(0)
                    .build();
            sessionGroupRepository.save(group);

            for (int j = 0; j < groupWords.size(); j++) {
                Word word = groupWords.get(j);
                Learning learning = Learning.builder()
                        .session(session)
                        .sessionGroup(group)
                        .word(word)
                        .pageOrder(pageOrder++)
                        .groupOrder(j+1)
                        .learned(false)
                        .build();
                learningBatch.add(learning);
            }
        }

        learningRepository.saveAll(learningBatch);
        session.setTotalWordCount(learningBatch.size());

        //  Redis 캐시 저장
        String orderKey = String.format("session:%d:wordOrder", session.getId());
        List<String> wordIds = learningBatch.stream()
                .sorted(Comparator.comparing(Learning::getPageOrder))
                .map(l -> l.getWord().getId().toString())
                .toList();
        stringRedisTemplate.opsForList().rightPushAll(orderKey, wordIds);
        stringRedisTemplate.expire(orderKey, Duration.ofDays(1));

        for (Learning learning : learningBatch) {
            Word word = learning.getWord();
            String infoKey = String.format("session:%d:wordInfo:%d", session.getId(), word.getId());
            Map<String, String> wordInfo = Map.of(
                    "wordEn", word.getWordEn(),
                    "wordKo", word.getWordKo(),
                    "imgUrl", word.getImgUrl()
            );
            stringRedisTemplate.opsForHash().putAll(infoKey, wordInfo);
            stringRedisTemplate.expire(infoKey, Duration.ofDays(1));
        }

        return session.getId();
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
        Child child = getVerifiedChild(userId, session.getChild().getId());

        // SessionGroup + 그 안의 Learning 소프트 삭제
        if (session.getSessionGroups() != null) {
            for (SessionGroup group : session.getSessionGroups()) {

                //  1. Learning 삭제
                if (group.getLearnings() != null) {
                    for (Learning learning : group.getLearnings()) {
                        if (!learning.isAlreadyDeleted()) {
                            learning.softDelete();
                        }
                    }
                }

                // 2. SessionGroup 삭제
                if (!group.isAlreadyDeleted()) {
                    group.softDelete();
                }
            }
        }

        // 마지막으로 Session soft delete
        if (!session.isAlreadyDeleted()) {
            session.softDelete();
        }
    }


    /**
     * 한 세션 내에서 그룹(SessionGroup) 단위로 단어 목록을 페이지별로 조회
     */
    public CustomPage<List<WordResponse>> getPagedWordsBySessionGroup(Integer userId, Integer sessionId, int page, int size) {
        // 세션 조회 및 권한 확인
        Session session = sessionRepository.findByIdAndDeletedFalse(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.SESSION_NOT_FOUND));
        getVerifiedChild(userId, session.getChild().getId());

        // 그룹 단위로 페이징 조회
        PageRequest pageRequest = PageRequest.of(page - 1, size, Sort.by("groupOrder"));
        Page<SessionGroup> sessionGroupPage = sessionGroupRepository.findAllBySessionIdAndDeletedFalse(sessionId, pageRequest);

        // 각 그룹의 단어들을 WordResponse 리스트로 변환
        Page<List<WordResponse>> wordGroupsPage = sessionGroupPage.map(group -> {
            List<Learning> learnings = group.getLearnings();
            return learnings.stream()
                    .map(WordResponse::of)
                    .toList();
        });

        // CustomPage로 반환
        return new CustomPage<>(wordGroupsPage);
    }




}
