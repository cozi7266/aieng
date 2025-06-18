package com.ssafy.aieng.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum TokenError {
    EXPIRED_TOKEN("토큰이 만료되었습니다."),
    MALFORMED_TOKEN("토큰 형식이 잘못되었습니다."),
    UNSUPPORTED_TOKEN("지원하지 않는 토큰입니다."),
    INVALID_SIGNATURE("서명이 유효하지 않습니다.");

    private final String message;
}

