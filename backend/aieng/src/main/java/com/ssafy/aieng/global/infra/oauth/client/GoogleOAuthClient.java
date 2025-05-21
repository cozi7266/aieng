package com.ssafy.aieng.global.infra.oauth.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.aieng.global.infra.oauth.constants.GoogleOAuthConstants;
import com.ssafy.aieng.global.infra.oauth.dto.google.GoogleTokenResponse;
import com.ssafy.aieng.global.infra.oauth.dto.google.GoogleUserResponse;
import lombok.RequiredArgsConstructor;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestBody;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class GoogleOAuthClient {
    private final OkHttpClient okHttpClient;
    private final ObjectMapper objectMapper;

    @Value("${oauth.google.client-id}")
    private String clientId;

    @Value("${oauth.google.client-secret}")
    private String clientSecret;

    @Value("${oauth.google.redirect-uri}")
    private String redirectUri;

    public GoogleTokenResponse getToken(String code) throws IOException {
        FormBody formBody = new FormBody.Builder()
                .add(GoogleOAuthConstants.Parameters.GRANT_TYPE, GoogleOAuthConstants.GrantTypes.AUTHORIZATION_CODE)
                .add(GoogleOAuthConstants.Parameters.CLIENT_ID, clientId)
                .add(GoogleOAuthConstants.Parameters.CLIENT_SECRET, clientSecret)
                .add(GoogleOAuthConstants.Parameters.REDIRECT_URI, redirectUri)
                .add(GoogleOAuthConstants.Parameters.CODE, code)
                .build();

        Request request = new Request.Builder()
                .url(GoogleOAuthConstants.Urls.TOKEN)
                .post(formBody)
                .build();


        try (Response response = okHttpClient.newCall(request).execute()) {
            assert response.body() != null;
            return objectMapper.readValue(response.body().string(), GoogleTokenResponse.class);
        }
    }

    public GoogleUserResponse getUserInfo(String accessToken) throws IOException {
        Request request = new Request.Builder()
                .url(GoogleOAuthConstants.Urls.USER_INFO)
                .header("Authorization", "Bearer " + accessToken)
                .get()
                .build();

        try (Response response = okHttpClient.newCall(request).execute()) {
            assert response.body() != null;
            return objectMapper.readValue(response.body().string(), GoogleUserResponse.class);
        }
    }
}
