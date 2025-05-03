package com.ssafy.aieng.domain.user.enums;

public enum Gender {
    N, //설정안함
    F, //여자
    M, //남자
    O; //기타

    public String getName() {
        return this.name().toLowerCase();
    }
}
