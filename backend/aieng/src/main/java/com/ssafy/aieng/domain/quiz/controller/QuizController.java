package com.ssafy.aieng.domain.quiz.controller;

import com.ssafy.aieng.global.common.util.AuthenticationUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.aieng.domain.quiz.dto.QuizCreateRequest;
import com.ssafy.aieng.domain.quiz.dto.QuizErrorResponse;
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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {
    private final QuizService quizService;
    private final AuthenticationUtil authenticationUtil;

    // 퀴즈 활성화 상태 확인
    @GetMapping("/status/{sessionId}")
    public ResponseEntity<?> checkQuizAvailability(@PathVariable Integer sessionId) {
        try {
            boolean isAvailable = quizService.checkQuizAvailability(sessionId);
            return ResponseEntity.ok(isAvailable);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(new QuizErrorResponse(e.getMessage(), "QUIZ_NOT_AVAILABLE"));
        }
    }

    // 퀴즈 생성
    @PostMapping("/create")
    public ResponseEntity<?> createQuiz(@RequestBody QuizCreateRequest request) {
        try {
            QuizResponse response = quizService.createQuiz(request);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(new QuizErrorResponse(e.getMessage(), "QUIZ_CREATION_FAILED"));
        }
    }

    // 퀴즈 조회
    @GetMapping("/{sessionId}")
    public ResponseEntity<?> getQuiz(@PathVariable Integer sessionId) {
        try {
            QuizResponse response = quizService.getQuizBySessionId(sessionId);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(new QuizErrorResponse(e.getMessage(), "QUIZ_NOT_FOUND"));
        }
    }
} 