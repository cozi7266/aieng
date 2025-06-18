package com.ssafy.aieng.domain.user.dto.response;

import com.ssafy.aieng.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserProfileResponse {

    private Integer userId;
    private String nickname;
    private String imgUrl;

    public static UserProfileResponse of(User user) {
        return UserProfileResponse.builder()
                .userId(user.getId())
                .nickname(user.getNickname())
                .imgUrl(user.getImgUrl())
                .build();
    }
}
