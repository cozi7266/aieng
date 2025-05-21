package com.ssafy.aieng.domain.book.service;

import com.ssafy.aieng.domain.book.dto.response.StorybookListResponse;
import com.ssafy.aieng.domain.book.dto.response.StorybookResponse;
import com.ssafy.aieng.domain.book.entity.LearningStorybook;
import com.ssafy.aieng.domain.book.entity.Storybook;
import com.ssafy.aieng.domain.book.repository.StorybookRepository;
import com.ssafy.aieng.domain.learning.entity.Learning;
import com.ssafy.aieng.domain.learning.repository.LearningRepository;
import com.ssafy.aieng.domain.session.entity.Session;
import com.ssafy.aieng.domain.session.repository.SessionRepository;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ssafy.aieng.global.common.CustomAuthentication;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StorybookService {

    private final StorybookRepository storybookRepository;
    private final LearningRepository learningRepository;
    private final SessionRepository sessionRepository;
    private final CustomAuthentication customAuthentication;


    private static final List<String> TITLE_TEMPLATES = List.of(
            "%s의 첫 그림책",
            "%s의 특별한 동화",
            "%s의 상상력이 담긴 이야기",
            "%s와 함께 떠나는 모험",
            "%s가 직접 만든 동화책"
    );


    private static final List<String> DESCRIPTION_TEMPLATES = List.of(
            "%s의 학습 기록을 바탕으로 만들어진 이야기입니다.",
            "오늘(%s)의 멋진 배움을 담았어요.",
            "학습한 단어로 %s만의 이야기를 만들어 보았어요.",
            "잊지 못할 %s의 하루를 담은 그림책입니다.",
            "%s의 머릿속 상상을 펼쳐 보았어요!"
    );

    private static final String DEFAULT_IMAGE_URL =
            "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Sample_User_Icon.png/480px-Sample_User_Icon.png";


    // 그림책 생성
    @Transactional
    public StorybookResponse createStorybook(Integer userId, Integer childId, Integer sessionId) {

        // 1. 자녀 소유자 검증
        customAuthentication.validateChildOwnership(userId, childId);

        // 2. 세션 검증 + 자녀 일치 여부 확인
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.SESSION_NOT_FOUND));


        // 같은 세션으로 그림책 중복 생성 막기
        boolean exists = storybookRepository.existsStorybookBySessionId(sessionId);
        if (exists) {
            throw new CustomException(ErrorCode.DUPLICATE_STORYBOOK);
        }

        // 3. 학습 완료 여부 확인
        long learnedCount = learningRepository.countBySessionIdAndLearned(sessionId, true);
        if (learnedCount < session.getTotalWordCount()) {
            throw new CustomException(ErrorCode.STORYBOOK_CREATION_FAILED);
        }

        // 4. 그림책 기본 제목/설명 자동 생성
        String title = session.getChild().getName() + "의 그림책";
        String description = LocalDate.now() + "의 학습을 바탕으로 생성된 그림책입니다.";

        // 대표 이미지(첫 번째 학습 이미지)
        List<Learning> learnings = learningRepository.findAllBySessionIdAndLearnedTrueOrderByPageOrder(sessionId);
        String coverUrl = learnings.isEmpty() ? DEFAULT_IMAGE_URL : learnings.get(0).getImgUrl();

        // 5. Storybook 생성
        Storybook storybook = Storybook.builder()
                .child(session.getChild())
                .session(session)
                .title(title)
                .description(description)
                .coverUrl(coverUrl)
                .build();

        // 6. 그림책에 학습 단어 연결
        for (int i = 0; i < learnings.size(); i++) {
            Learning learning = learnings.get(i);

            LearningStorybook ls = LearningStorybook.builder()
                    .storybook(storybook)
                    .learning(learning)
                    .pageOrder(i)
                    .build();

            storybook.addLearningStorybook(ls);
        }

        // 7. 세션 상태 업데이트
        session.markStoryDone();

        // 8. 저장 및 응답 반환
        storybookRepository.save(storybook);
        return StorybookResponse.from(storybook);
    }


    // 자녀의 그림책 목록 조회
    @Transactional(readOnly = true)
    public List<StorybookListResponse> getStorybooksByChild(Integer userId, Integer childId) {
        customAuthentication.validateChildOwnership(userId, childId);

        return storybookRepository.findAllByChildIdAndDeletedFalseOrderByCreatedAtDesc(childId).stream()
                .map(StorybookListResponse::from)
                .collect(Collectors.toList());
    }

    // 그림책 상세 조회
    @Transactional(readOnly = true)
    public StorybookResponse getStorybookDetail(Integer userId, Integer childId, Integer storybookId) {
        Storybook storybook = storybookRepository.findById(storybookId)
                .orElseThrow(() -> new CustomException(ErrorCode.STORYBOOK_NOT_FOUND));
        customAuthentication.validateChildOwnership(userId, storybook.getChild().getId());
        return StorybookResponse.from(storybook);
    }

    // 그림책 삭제
    @Transactional
    public void deleteStorybook(Integer userId, Integer storybookId) {
        Storybook storybook = storybookRepository.findById(storybookId)
                .orElseThrow(() -> new CustomException(ErrorCode.STORYBOOK_NOT_FOUND));
        customAuthentication.validateChildOwnership(userId, storybook.getChild().getId());
        storybook.softDelete();
        storybookRepository.save(storybook);
    }

}
