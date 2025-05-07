package com.ssafy.aieng.domain.user.dto.response;

import com.ssafy.aieng.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ParentInfoResponse {
    private Integer userId;
    private String nickname;

    public static ParentInfoResponse of(User user) {
        return ParentInfoResponse.builder()
                .userId(user.getId())
                .nickname(user.getNickname())
                .build();
    }
}
