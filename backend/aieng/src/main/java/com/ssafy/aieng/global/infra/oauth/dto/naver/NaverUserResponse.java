package com.ssafy.aieng.global.infra.oauth.dto.naver;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NaverUserResponse {
    @JsonProperty("resultcode")
    private String resultcode;

    @JsonProperty("message")
    private String message;

    @JsonProperty("response")
    private NaverAccount response;

    @Getter
    @Setter
    public static class NaverAccount {
        @JsonProperty("id")
        private String id;

    }
}
