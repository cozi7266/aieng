package com.ssafy.aieng.global.infra.oauth.client;

import com.fasterxml.jackson.databind.ObjectMapper;

import com.ssafy.aieng.global.infra.oauth.constants.KakaoOAuthConstants;
import com.ssafy.aieng.global.infra.oauth.dto.kakao.KakaoTokenResponse;
import com.ssafy.aieng.global.infra.oauth.dto.kakao.KakaoUserResponse;
import lombok.RequiredArgsConstructor;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class KaKaoOAuthClient {
    private final OkHttpClient okHttpClient;
    private final ObjectMapper objectMapper;

    @Value("${oauth.kakao.client-id}")
    private String clientId;

    @Value("${oauth.kakao.redirect-uri}")
    private String redirectUri;

    public KakaoTokenResponse getToken(String code) throws IOException {
        RequestBody formBody = new FormBody.Builder()
                .add(KakaoOAuthConstants.Parameters.GRANT_TYPE, KakaoOAuthConstants.GrantTypes.AUTHORIZATION_CODE)
                .add(KakaoOAuthConstants.Parameters.CLIENT_ID, clientId)
                .add(KakaoOAuthConstants.Parameters.REDIRECT_URI, redirectUri)
                .add(KakaoOAuthConstants.Parameters.CODE, code)
                .build();

        Request request = new Request.Builder()
                .url(KakaoOAuthConstants.Urls.TOKEN)
                .post(formBody)
                .build();

        try (Response response = okHttpClient.newCall(request).execute()) {
            assert response.body() != null;
            return objectMapper.readValue(response.body().string(), KakaoTokenResponse.class);
        }
    }

    public KakaoUserResponse getUserInfo(String accessToken) throws IOException {
        Request request = new Request.Builder()
                .url(KakaoOAuthConstants.Urls.USER_INFO)
                .addHeader("Authorization", "Bearer " + accessToken)
                .get()
                .build();

        try (Response response = okHttpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("카카오 사용자 정보 조회 실패");
            }

            String rawJson = response.body().string();

            return objectMapper.readValue(rawJson, KakaoUserResponse.class);
        }
    }

}
