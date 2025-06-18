package com.ssafy.aieng.domain.auth.dto;

import com.ssafy.aieng.domain.auth.dto.response.OAuthLoginResponse;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResult {
    private OAuthLoginResponse response;
    private String refreshToken;

    public static LoginResult of(OAuthLoginResponse response, String refreshToken) {
        return LoginResult.builder()
                .response(response)
                .refreshToken(refreshToken)
                .build();
    }
}
