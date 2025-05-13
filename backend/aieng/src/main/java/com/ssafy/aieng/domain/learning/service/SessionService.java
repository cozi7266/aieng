package com.ssafy.aieng.domain.learning.service;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.aieng.domain.child.entity.Child;
import com.ssafy.aieng.domain.child.repository.ChildRepository;
import com.ssafy.aieng.domain.child.service.ChildService;
import com.ssafy.aieng.domain.learning.dto.response.LearningWordResponse;
import com.ssafy.aieng.domain.learning.entity.Learning;
import com.ssafy.aieng.domain.learning.entity.Session;
import com.ssafy.aieng.domain.learning.entity.SessionGroup;
import com.ssafy.aieng.domain.learning.repository.LearningRepository;
import com.ssafy.aieng.domain.learning.repository.SessionGroupRepository;
import com.ssafy.aieng.domain.learning.repository.SessionRepository;
import com.ssafy.aieng.domain.theme.entity.Theme;
import com.ssafy.aieng.domain.theme.repository.ThemeRepository;
import com.ssafy.aieng.domain.user.repository.UserRepository;
import com.ssafy.aieng.domain.word.entity.Word;
import com.ssafy.aieng.domain.word.repository.WordRepository;
import com.ssafy.aieng.global.common.redis.service.RedisService;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

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
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Transactional
    public Integer createLearningSession(Integer userId, Integer childId, Integer themeId) {
        // 1. 소유자 검증
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));
        if (!child.getParent().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // 2. 테마 확인
        Theme theme = themeRepository.findById(themeId)
                .orElseThrow(() -> new CustomException(ErrorCode.THEME_NOT_FOUND));

        // 3. Session 생성
        Session session = Session.of(child, theme);
        sessionRepository.save(session);

        // 4. 단어 불러오기 + 셔플
        List<Word> words = wordRepository.findAllByThemeId(themeId);
        Collections.shuffle(words);

        int pageOrder = 0;
        int groupOrder = 0;
        List<Learning> allLearnings = new ArrayList<>();

        for (int i = 0; i < words.size(); i += 5) {
            List<Word> groupWords = words.subList(i, Math.min(i + 5, words.size()));

            // SessionGroup 생성
            SessionGroup group = SessionGroup.builder()
                    .session(session)
                    .groupOrder(groupOrder++)
                    .completed(false)
                    .build();
            sessionGroupRepository.save(group);

            // 각 단어에 대해 Learning 생성
            for (Word word : groupWords) {
                Learning learning = Learning.builder()
                        .session(session)
                        .sessionGroup(group)
                        .word(word)
                        .pageOrder(pageOrder++)
                        .learned(false)
                        .build();

                allLearnings.add(learning);
            }
        }

        learningRepository.saveAll(allLearnings);
        session.setWordCount(allLearnings.size());

        return session.getId();
    }


}
