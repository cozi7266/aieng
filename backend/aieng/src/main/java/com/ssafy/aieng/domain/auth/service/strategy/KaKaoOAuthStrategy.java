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
            log.debug("📤 카카오 OAuth 코드 수신: {}", code);

            KakaoTokenResponse tokenResponse = kakaoOAuthClient.getToken(code);
            String accessToken = tokenResponse.getAccessToken();
            log.debug("✅ 액세스 토큰 획득: {}", accessToken);

            KakaoUserResponse userResponse = kakaoOAuthClient.getUserInfo(accessToken);
            log.debug("✅ 사용자 정보 응답: {}", objectMapper.writeValueAsString(userResponse));

            if (userResponse == null || userResponse.getId() == null || userResponse.getKakaoAccount() == null) {
                log.error("🚨 응답 필수 필드 누락");
                throw new CustomException(ErrorCode.OAUTH_SERVER_ERROR);
            }

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
            log.error("❌ Kakao OAuth 예외 발생 - {}", e.getMessage(), e);
            throw new CustomException(ErrorCode.OAUTH_SERVER_ERROR);
        }
    }
}
