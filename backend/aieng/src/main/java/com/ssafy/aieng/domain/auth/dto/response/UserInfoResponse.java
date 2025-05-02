package com.ssafy.aieng.domain.auth.dto.response;

import com.ssafy.aieng.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserInfoResponse {
    private String id;
    private String nickname;
    private Boolean isNew;

    public static UserInfoResponse of(User user, Boolean isNew) {
        return UserInfoResponse.builder()
                .id(user.getId().toString())
                .nickname(user.getNickname())
                .isNew(isNew)
                .build();
    }
}
