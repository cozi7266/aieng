package com.ssafy.aieng.domain.auth.service.strategy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.aieng.domain.auth.dto.OAuthUserInfo;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import com.ssafy.aieng.global.infra.oauth.client.KaKaoOAuthClient;
import com.ssafy.aieng.global.infra.oauth.dto.kakao.KakaoTokenResponse;
import com.ssafy.aieng.global.infra.oauth.dto.kakao.KakaoUserResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Slf4j
@Service
@RequiredArgsConstructor
public class KaKaoOAuthStrategy implements OAuthStrategy {

    private final KaKaoOAuthClient kakaoOAuthClient;
    private final ObjectMapper objectMapper;

    @Override
    public OAuthUserInfo getUserInfo(String code) {
        try {
            // 1. 액세스 토큰 요청
            KakaoTokenResponse tokenResponse = kakaoOAuthClient.getToken(code);
            String accessToken = tokenResponse.getAccessToken();

            // 2. 사용자 정보 요청
            KakaoUserResponse userResponse = kakaoOAuthClient.getUserInfo(accessToken);

            // 3. 전체 응답 로그 출력
            log.debug("✅ KakaoUserResponse: {}", objectMapper.writeValueAsString(userResponse));

            // 4. 필수 필드 체크
            if (userResponse == null || userResponse.getId() == null || userResponse.getKakaoAccount() == null) {
                log.error("🚨 KakaoUserResponse null 또는 필드 누락 발생");
                throw new CustomException(ErrorCode.OAUTH_SERVER_ERROR);
            }

            // 5. 세부 필드 처리 (null-safe)
            String email = userResponse.getKakaoAccount().getEmail();
            String nickname = (userResponse.getKakaoAccount().getProfile() != null)
                    ? userResponse.getKakaoAccount().getProfile().getNickname()
                    : null;

            return OAuthUserInfo.builder()
                    .id(String.valueOf(userResponse.getId()))
                    .email(email != null ? email : "no-email@kakao.com")
                    .nickname(nickname)
                    .build();

        } catch (IOException e) {
            log.error("❌ IOException during Kakao OAuth 처리 중 예외 발생: {}", e.getMessage(), e);
            throw new CustomException(ErrorCode.OAUTH_SERVER_ERROR);
        }
    }
}
