package com.ssafy.aieng.domain.user.dto.response;

import com.ssafy.aieng.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class UserMypageResponse {

    private String nickname;
    private String profileURL;

}
