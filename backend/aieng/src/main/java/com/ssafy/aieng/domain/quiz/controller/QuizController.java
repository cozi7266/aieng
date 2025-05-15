package com.ssafy.aieng.domain.quiz.controller;

import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.common.util.AuthenticationUtil;
import com.ssafy.aieng.global.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.aieng.domain.quiz.dto.response.QuizResponse;
import com.ssafy.aieng.domain.quiz.service.QuizService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {
    private final QuizService quizService;
    private final AuthenticationUtil authenticationUtil;

    // 퀴즈 활성화 상태 확인
    @GetMapping("/status/{sessionId}")
    public ResponseEntity<ApiResponse<Boolean>> checkQuizAvailability(
            @PathVariable Integer sessionId,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        boolean available = quizService.checkQuizAvailability(user.getId(), sessionId);
        return ApiResponse.success(HttpStatus.OK);
    }


    // 퀴즈 생성
    @PostMapping("/create/{sessionId}")
    public ResponseEntity<ApiResponse<QuizResponse>> createQuiz(
            @PathVariable Integer sessionId,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        QuizResponse response = quizService.createQuiz(user.getId(), sessionId);
        return ApiResponse.success(response);
    }



    // 퀴즈 조회
    @GetMapping("/{sessionId}")
    public ResponseEntity<ApiResponse<QuizResponse>> getQuiz(
            @PathVariable Integer sessionId,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        QuizResponse response = quizService.getQuizBySessionId(user.getId(), sessionId);
        return ApiResponse.success(response);
    }

} 