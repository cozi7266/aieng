package com.ssafy.aieng.domain.user.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileCreateRequest {

    private String userNickname;
    private String userImgUrl;

}
