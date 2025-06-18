package com.ssafy.aieng.domain.auth.service.strategy;

import com.ssafy.aieng.domain.auth.dto.OAuthUserInfo;
import com.ssafy.aieng.global.infra.oauth.client.GoogleOAuthClient;
import com.ssafy.aieng.global.infra.oauth.dto.google.GoogleTokenResponse;
import com.ssafy.aieng.global.infra.oauth.dto.google.GoogleUserResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleOAuthStrategy implements OAuthStrategy {
    private final GoogleOAuthClient googleOAuthClient;

    @Override
    public OAuthUserInfo getUserInfo(String code) throws IOException {
        GoogleTokenResponse tokenResponse = googleOAuthClient.getToken(code);

        GoogleUserResponse userResponse = googleOAuthClient.getUserInfo(tokenResponse.getAccessToken());

        return OAuthUserInfo.builder()
                .id(userResponse.getId())
                .email(userResponse.getEmail())
                .nickname(userResponse.getName()) // Google의 name을 nickname으로 사용
                .build();
    }
}