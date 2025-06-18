package com.ssafy.aieng.domain.auth.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class OAuthLoginRequest {
    private String code;
    private String state;  // 네이버에서만 사용
}
