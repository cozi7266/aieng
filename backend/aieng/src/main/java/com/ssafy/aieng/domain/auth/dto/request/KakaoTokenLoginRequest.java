package com.ssafy.aieng.domain.auth.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class KakaoTokenLoginRequest {
    private String token;
}
