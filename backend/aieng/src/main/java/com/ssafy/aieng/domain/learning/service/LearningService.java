package com.ssafy.aieng.domain.learning.service;

import com.ssafy.aieng.domain.child.entity.Child;
import com.ssafy.aieng.domain.child.repository.ChildRepository;
import com.ssafy.aieng.domain.child.service.ChildService;
import com.ssafy.aieng.domain.learning.dto.response.LearningWordResponse;
import com.ssafy.aieng.domain.learning.dto.response.ThemeProgressResponse;
import com.ssafy.aieng.domain.learning.entity.Learning;
import com.ssafy.aieng.domain.learning.entity.Session;
import com.ssafy.aieng.domain.learning.repository.LearningRepository;
import com.ssafy.aieng.domain.learning.repository.SessionRepository;
import com.ssafy.aieng.domain.theme.entity.Theme;
import com.ssafy.aieng.domain.theme.repository.ThemeRepository;
import com.ssafy.aieng.domain.word.entity.Word;
import com.ssafy.aieng.domain.word.repository.WordRepository;
import com.ssafy.aieng.global.common.CustomPage;
import com.ssafy.aieng.global.common.redis.service.RedisService;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LearningService {

    private final RedisService redisService;
    private final LearningRepository learningRepository;
    private final SessionRepository sessionRepository;
    private final ChildService childService;
    private final ThemeRepository themeRepository;
    private final WordRepository wordRepository;
    private final ChildRepository childRepository;

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
    public CustomPage<LearningWordResponse> getOrCreateLearningSession(
            Integer childId,
            Integer themeId,
            Integer userId,
            Pageable pageable
    ) {
        // 1. Session 조회 (없으면 생성)
        Session session = sessionRepository.findByChildIdAndThemeId(childId, themeId)
                .orElseGet(() -> {
                    Child child = childRepository.findById(childId)
                            .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));

                    Theme theme = themeRepository.findById(themeId)
                            .orElseThrow(() -> new CustomException(ErrorCode.THEME_NOT_FOUND));

                    Session newSession = Session.builder()
                            .child(child)
                            .theme(theme)
                            .startedAt(LocalDateTime.now())
                            .wordCount(0)
                            .build();

                    sessionRepository.save(newSession);

                    // 랜덤 단어 저장
                    List<Word> words = wordRepository.findAllByThemeId(themeId);
                    Collections.shuffle(words);

                    List<Learning> learnings = new ArrayList<>();
                    for (Word word : words) {
                        Learning learning = Learning.builder()
                                .session(newSession)
                                .word(word)
                                .sentence("") // 문장이 있다면 넣기
                                .imgUrl(word.getImgUrl())
                                .ttsUrl(word.getTtsUrl())
                                .learned(false)
                                .build();
                        learnings.add(learning);
                    }

                    learningRepository.saveAll(learnings);
                    newSession.setWordCount(learnings.size());
                    return newSession;
                });

        // 2. 해당 세션의 단어 목록 페이징 조회
        Page<Learning> page = learningRepository.findAllBySessionId(session.getId(), pageable);

        List<LearningWordResponse> dtoList = page.getContent().stream()
                .map(LearningWordResponse::of)
                .toList();

        return new CustomPage<>(new PageImpl<>(dtoList, pageable, page.getTotalElements()));
    }
}
