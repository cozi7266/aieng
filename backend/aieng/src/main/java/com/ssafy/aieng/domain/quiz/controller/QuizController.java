package com.ssafy.aieng.domain.quiz.controller;

import com.ssafy.aieng.global.common.util.AuthenticationUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.aieng.domain.quiz.dto.QuizCreateRequest;
import com.ssafy.aieng.domain.quiz.dto.QuizResponse;
import com.ssafy.aieng.domain.quiz.service.QuizService;

import lombok.RequiredArgsConstructor;

import com.ssafy.aieng.domain.quiz.dto.QuizStatusResponse;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import com.ssafy.aieng.global.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {
    private final QuizService quizService;
    private final AuthenticationUtil authenticationUtil;

    // 퀴즈 활성화 상태 확인
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<QuizStatusResponse>> checkQuizStatus(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        // 사용자 인증 확인
        if (userPrincipal == null) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        if (userId == null) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        boolean isQuizActive = quizService.checkQuizAvailability(String.valueOf(userId));
        return ApiResponse.success(new QuizStatusResponse(isQuizActive));
    }

    // 퀴즈 생성
    @PostMapping("/create")
    public ResponseEntity<QuizResponse> createQuiz(@RequestBody QuizCreateRequest request) {
        QuizResponse response = quizService.createQuiz(request);
        return ResponseEntity.ok(response);
    }
} 