package com.ssafy.aieng.domain.auth.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OAuthLoginResponse {
    private String accessToken;
    private UserInfoResponse user;

    public static OAuthLoginResponse of(String accessToken, UserInfoResponse userInfoResponse) {
        return OAuthLoginResponse.builder()
                .accessToken(accessToken)
                .user(userInfoResponse)
                .build();
    }
}
