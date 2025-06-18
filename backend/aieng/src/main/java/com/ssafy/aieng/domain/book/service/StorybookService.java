package com.ssafy.aieng.domain.book.service;

import com.ssafy.aieng.domain.book.dto.request.StorybookCreateRequest;
import com.ssafy.aieng.domain.book.dto.response.StorybookResponse;
import com.ssafy.aieng.domain.book.entity.LearningStorybook;
import com.ssafy.aieng.domain.book.entity.Storybook;
import com.ssafy.aieng.domain.book.repository.LearningStorybookRepository;
import com.ssafy.aieng.domain.book.repository.StorybookRepository;
import com.ssafy.aieng.domain.child.entity.Child;
import com.ssafy.aieng.domain.child.repository.ChildRepository;
import com.ssafy.aieng.domain.learning.entity.Learning;
import com.ssafy.aieng.domain.learning.repository.LearningRepository;
import com.ssafy.aieng.domain.theme.entity.Theme;
import com.ssafy.aieng.domain.theme.repository.ThemeRepository;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class StorybookService {

    private final StorybookRepository storybookRepository;
    private final LearningStorybookRepository learningStorybookRepository;
    private final ChildRepository childRepository;
    private final ThemeRepository themeRepository;
    private final LearningRepository learningRepository;

    @Transactional
    public StorybookResponse createStorybook(Integer themeId, StorybookCreateRequest request) {
        // 1. 아이 조회
        Child child = childRepository.findById(request.getChildId())
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));

        // 2. 테마 조회
        Theme theme = themeRepository.findById(themeId)
                .orElseThrow(() -> new CustomException(ErrorCode.THEME_NOT_FOUND));

        // 3. 해당 테마에서 학습 완료된 단어 5개 조회
        List<Learning> completedLearnings = learningRepository
                .findTop5ByWordThemeIdAndLearnedTrueOrderByLearnedAtDesc(themeId);

        if (completedLearnings.isEmpty()) {
            throw new CustomException(ErrorCode.BOOK_NO_COMPLETED_LEARNING);
        }

        // 4. 그림책 생성
        String coverUrl = String.format(
                "https://s3.amazonaws.com/aieng-bucket/storybooks/%s_cover.png", theme.getThemeName());

        Storybook storybook = Storybook.builder()
                .childId(child.getId())
                .coverUrl(coverUrl)
                .title(request.getTitle())
                .description(request.getDescription())
                .build();

        // 5. 학습 기록과 연결
        for (int i = 0; i < completedLearnings.size(); i++) {
            Learning learning = completedLearnings.get(i);

            LearningStorybook learningStorybook = LearningStorybook.builder()
                    .storybook(storybook)
                    .learning(learning)
                    .order(i + 1)
                    .build();

            storybook.addLearningStorybook(learningStorybook);
        }

        // 6. 저장
        storybookRepository.save(storybook);

        // 7. 반환
        return StorybookResponse.from(storybook);
    }

}
