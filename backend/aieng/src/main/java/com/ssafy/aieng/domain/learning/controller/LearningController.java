package com.ssafy.aieng.domain.learning.controller;

import com.ssafy.aieng.domain.learning.service.LearningService;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.common.util.AuthenticationUtil;
import com.ssafy.aieng.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/learning")
public class LearningController {
    private final LearningService learningService;
    private final AuthenticationUtil authenticationUtil;

    // TODO: 학습 관련 API 메서드 추가 시 아래와 같은 인증 체크 패턴 사용
    /*
    @GetMapping("/example")
    public ResponseEntity<ApiResponse<?>> exampleEndpoint(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            // 사용자 인증 확인
            Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
            if (userId == null) {
                return ApiResponse.fail("인증되지 않은 사용자입니다.", HttpStatus.UNAUTHORIZED);
            }

            // 비즈니스 로직 수행
            return ApiResponse.success(null);
        } catch (Exception e) {
            return ApiResponse.fail("요청 처리에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    */
} 