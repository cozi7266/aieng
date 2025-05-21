package com.ssafy.aieng.domain.auth.controller;

import com.ssafy.aieng.domain.auth.dto.LoginResult;
import com.ssafy.aieng.domain.auth.dto.request.KakaoTokenLoginRequest;
import com.ssafy.aieng.domain.auth.dto.request.OAuthLoginRequest;
import com.ssafy.aieng.domain.auth.dto.response.OAuthLoginResponse;
import com.ssafy.aieng.domain.auth.service.OAuthService;
import com.ssafy.aieng.domain.user.enums.Provider;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.common.util.CookieUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/oauth")
@RequiredArgsConstructor
public class OAuthController {
    private final OAuthService oAuthService;

    // [공통] 소셜 로그인 (provider: "google", "kakao" 등) - code로 로그인 처리
    @PostMapping("/{provider}")
    public ResponseEntity<ApiResponse<OAuthLoginResponse>> socialLogin(
            @PathVariable String provider,
            @RequestBody OAuthLoginRequest request) {
        LoginResult loginResult = oAuthService.handleOAuthLogin(Provider.valueOf(provider.toUpperCase()), request.getCode());

        // RefreshToken을 HttpOnly 쿠키로 설정
        ResponseCookie responseCookie = CookieUtil.makeRefreshTokenCookie(loginResult.getRefreshToken());

        return ApiResponse.success(loginResult.getResponse(), responseCookie);
    }


    // [네이버 전용] 네이버 로그인 (code, state 사용)
    @PostMapping("/naver")
    public ResponseEntity<ApiResponse<OAuthLoginResponse>> naverLogin(
            @RequestBody OAuthLoginRequest request) {

        LoginResult loginResult = oAuthService.handleNaverOAuthLogin(
                request.getCode(),
                request.getState()
        );

        ResponseCookie responseCookie = CookieUtil.makeRefreshTokenCookie(loginResult.getRefreshToken());
        return ApiResponse.success(loginResult.getResponse(), responseCookie);
    }

    // [앱 전용] 카카오 Access Token 직접 받아서 로그인 (code 없이 token 사용)
    @PostMapping("/kakao/token")
    public ResponseEntity<ApiResponse<OAuthLoginResponse>> kakaoLoginWithToken(
            @RequestBody KakaoTokenLoginRequest request) {

        LoginResult loginResult = oAuthService.handleKakaoLoginWithAccessToken(request.getToken());
        ResponseCookie responseCookie = CookieUtil.makeRefreshTokenCookie(loginResult.getRefreshToken());
        return ApiResponse.success(loginResult.getResponse(), responseCookie);
    }

}
