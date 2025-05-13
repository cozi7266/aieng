package com.ssafy.aieng.domain.learning.controller;

import com.ssafy.aieng.domain.learning.dto.response.QuizStatusResponse;
import com.ssafy.aieng.domain.learning.service.QuizService;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.common.util.AuthenticationUtil;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import com.ssafy.aieng.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
} 