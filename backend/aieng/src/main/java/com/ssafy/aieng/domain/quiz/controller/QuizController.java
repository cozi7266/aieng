package com.ssafy.aieng.domain.quiz.controller;

import com.ssafy.aieng.domain.quiz.dto.request.SubmitAnswerRequest;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.common.util.AuthenticationUtil;
import com.ssafy.aieng.global.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.ssafy.aieng.domain.quiz.dto.response.QuizResponse;
import com.ssafy.aieng.domain.quiz.service.QuizService;

import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    // 퀴즈 활성화 상태 확인
    @GetMapping("/status/{sessionId}")
    public ResponseEntity<ApiResponse<Boolean>> checkQuizAvailability(
            @PathVariable Integer sessionId,
            @AuthenticationPrincipal UserPrincipal user,
            @RequestHeader("X-Child-Id") Integer childId
    ) {
        boolean available = quizService.checkQuizAvailability(user.getId(), sessionId , childId);
        return ApiResponse.success(available);
    }

    // 퀴즈 생성
    @PostMapping("/create/{sessionId}")
    public ResponseEntity<ApiResponse<QuizResponse>> createQuiz(
            @PathVariable Integer sessionId,
            @AuthenticationPrincipal UserPrincipal user,
            @RequestHeader("X-Child-Id") Integer childId
    ) {
        QuizResponse response = quizService.createQuiz(user.getId(), sessionId, childId);
        return ApiResponse.success(response);
    }

    // 퀴즈 조회
    @GetMapping("/{sessionId}")
    public ResponseEntity<ApiResponse<QuizResponse>> getQuiz(
            @PathVariable Integer sessionId,
            @AuthenticationPrincipal UserPrincipal user,
            @RequestHeader("X-Child-Id") Integer childId
    ) {
        QuizResponse response = quizService.getQuizBySessionId(user.getId(), sessionId, childId);
        return ApiResponse.success(response);
    }

    // 퀴즈 학습 제출
    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> submitAnswer(
            @RequestBody SubmitAnswerRequest request,
            @AuthenticationPrincipal UserPrincipal user,
            @RequestHeader("X-Child-Id") Integer childId
    ) {
        boolean isCorrect = quizService.submitAnswer(
                user.getId(),
                childId,
                request.getQuizQuestionId(),
                request.getSelectedChoiceId()
        );

        Map<String, Boolean> result = Map.of("isCorrect", isCorrect);
        return ApiResponse.success(result);
    }


}