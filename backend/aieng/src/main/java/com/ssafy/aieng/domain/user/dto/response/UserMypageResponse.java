package com.ssafy.aieng.domain.user.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserMypageResponse {

    private String nickname;
    private String profileURL;

}
