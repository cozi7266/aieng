package com.ssafy.aieng.global.infra.oauth.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.aieng.global.infra.oauth.constants.NaverOAuthConstants;
import com.ssafy.aieng.global.infra.oauth.dto.naver.NaverTokenResponse;
import com.ssafy.aieng.global.infra.oauth.dto.naver.NaverUserResponse;
import lombok.RequiredArgsConstructor;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class NaverOAuthClient {
    private final OkHttpClient okHttpClient;
    private final ObjectMapper objectMapper;

    @Value("${oauth.naver.client-id}")
    private String clientId;

    @Value("${oauth.naver.client-secret}")
    private String clientSecret;

    @Value("${oauth.naver.redirect-uri}")
    private String redirectUri;

    public NaverTokenResponse getToken(String code, String state) throws IOException {
        RequestBody formBody = new FormBody.Builder()
                .add(NaverOAuthConstants.Parameters.GRANT_TYPE, NaverOAuthConstants.GrantTypes.AUTHORIZATION_CODE)
                .add(NaverOAuthConstants.Parameters.CLIENT_ID, clientId)
                .add(NaverOAuthConstants.Parameters.CLIENT_SECRET, clientSecret)
                .add(NaverOAuthConstants.Parameters.REDIRECT_URI, redirectUri)
                .add(NaverOAuthConstants.Parameters.CODE, code)
                .add(NaverOAuthConstants.Parameters.STATE, state)
                .build();

        Request request = new Request.Builder()
                .url(NaverOAuthConstants.Urls.TOKEN)
                .post(formBody)
                .build();

        try (Response response = okHttpClient.newCall(request).execute()) {
            String responseBody = response.body() != null ? response.body().string() : "";
            return objectMapper.readValue(responseBody, NaverTokenResponse.class);
        }
    }

    public NaverUserResponse getUserInfo(String accessToken) throws IOException {
        String authHeader = "Bearer " + accessToken;

        Request request = new Request.Builder()
                .url(NaverOAuthConstants.Urls.USER_INFO)
                .header("Authorization", authHeader)
                .get()
                .build();

        try (Response response = okHttpClient.newCall(request).execute()) {
            int code = response.code();
            String responseBody = response.body() != null ? response.body().string() : "";


            if (!response.isSuccessful()) {
                throw new IOException("사용자 정보 요청 실패 - code: " + code);
            }

            return objectMapper.readValue(responseBody, NaverUserResponse.class);
        }
    }
}
