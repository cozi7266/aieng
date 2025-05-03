package com.ssafy.aieng.domain.auth.service.strategy;

import com.ssafy.aieng.domain.auth.dto.OAuthUserInfo;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import com.ssafy.aieng.global.infra.oauth.client.KaKaoOAuthClient;
import com.ssafy.aieng.global.infra.oauth.dto.kakao.KakaoTokenResponse;
import com.ssafy.aieng.global.infra.oauth.dto.kakao.KakaoUserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class KaKaoOAuthStrategy implements OAuthStrategy {
    private final KaKaoOAuthClient kakaoOAuthClient;

    @Override
    public OAuthUserInfo getUserInfo(String code) {
        try {
            KakaoTokenResponse tokenResponse = kakaoOAuthClient.getToken(code);

            KakaoUserResponse userResponse = kakaoOAuthClient.getUserInfo(tokenResponse.getAccessToken());

            return OAuthUserInfo.builder()
                    .id(userResponse.getId().toString())
                    .email(userResponse.getKakaoAccount().getEmail())
                    .nickname(userResponse.getKakaoAccount().getProfile().getNickname())
                    .build();
        } catch (IOException e) {
            throw new CustomException(ErrorCode.OAUTH_SERVER_ERROR);
        }
    }
}
