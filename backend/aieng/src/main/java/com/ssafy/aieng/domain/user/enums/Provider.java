package com.ssafy.aieng.domain.user.enums;

public enum Provider {
    KAKAO,
    GOOGLE,
    NAVER;

    public String getName() {
        return this.name().toLowerCase();
    }
}
