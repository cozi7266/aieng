package com.ssafy.aieng.domain.book.service;

import com.ssafy.aieng.domain.book.dto.request.StorybookCreateRequest;
import com.ssafy.aieng.domain.book.dto.response.StorybookResponse;
import com.ssafy.aieng.domain.book.entity.LearningStorybook;
import com.ssafy.aieng.domain.book.entity.Storybook;
import com.ssafy.aieng.domain.book.repository.LearningStorybookRepository;
import com.ssafy.aieng.domain.book.repository.StorybookRepository;
import com.ssafy.aieng.domain.learning.entity.Learning;
import com.ssafy.aieng.domain.learning.repository.LearningRepository;
import com.ssafy.aieng.domain.theme.entity.Theme;
import com.ssafy.aieng.domain.theme.repository.ThemeRepository;
import com.ssafy.aieng.domain.child.entity.Child;
import com.ssafy.aieng.domain.child.repository.ChildRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class StorybookServiceImpl implements StorybookService {

    private final StorybookRepository storybookRepository;
    private final LearningStorybookRepository learningStorybookRepository;
    private final ChildRepository childRepository;
    private final ThemeRepository themeRepository;
    private final LearningRepository learningRepository;

    @Override
    @Transactional
    public StorybookResponse createStorybook(String themeId, StorybookCreateRequest request) {
        // 아이와 테마 찾기
        Child child = childRepository.findById(request.getChildId())
                .orElseThrow(() -> new EntityNotFoundException("Child not found with id: " + request.getChildId()));

        Theme theme = themeRepository.findById(Long.parseLong(themeId))
                .orElseThrow(() -> new EntityNotFoundException("Theme not found with id: " + themeId));

        // 해당 테마에서 학습 완료된 단어들 찾기 (최대 5개)
        List<Learning> completedLearnings = learningRepository.findTop5ByWordThemeIdAndLearnedTrueOrderByLearnedAtDesc(
                Integer.parseInt(themeId));

        if (completedLearnings.isEmpty()) {
            throw new IllegalStateException(
                String.format("테마 '%s'에 대해 완료된 학습이 없습니다. 먼저 단어 학습을 완료해주세요.", theme.getName())
            );
        }

        // 그림책 생성
        String coverUrl = String.format("https://s3.amazonaws.com/aieng-bucket/storybooks/%s_cover.png", theme.getName());
        
        Storybook storybook = Storybook.builder()
                .childId(child.getId())
                .coverUrl(coverUrl)
                .title(request.getTitle())
                .description(request.getDescription())
                .build();
        
        storybookRepository.save(storybook);

        // 학습 데이터를 기반으로 LearningStorybook 생성
        for (int i = 0; i < completedLearnings.size(); i++) {
            Learning learning = completedLearnings.get(i);
            
            LearningStorybook learningStorybook = LearningStorybook.builder()
                    .storybook(storybook)
                    .learning(learning)
                    .order(i + 1)
                    .build();

            storybook.addLearningStorybook(learningStorybook);
        }

        storybookRepository.save(storybook);

        return StorybookResponse.from(storybook);
    }
} 