package com.ssafy.aieng.domain.auth.controller;

import com.ssafy.aieng.domain.auth.dto.response.TokenRefreshResponse;
import com.ssafy.aieng.domain.auth.service.OAuthService;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.common.util.CookieUtil;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final OAuthService oAuthService;

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refreshToken(
            @CookieValue(name = "refresh_token", required = false) String refreshToken) {
        if (refreshToken == null) {
            throw new CustomException(ErrorCode.REFRESH_TOKEN_NOT_FOUND);
        }

        TokenRefreshResponse response = oAuthService.refreshToken(refreshToken);
        return ApiResponse.success(response);
    }

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        ResponseCookie deleteCookie = CookieUtil.deleteRefreshTokenCookie();

        return ResponseEntity
                .ok()
                .header("Set-Cookie", deleteCookie.toString())
                .body(new ApiResponse<>(true, null, null)); // 또는 아래처럼도 가능
    }
}
