package com.ssafy.aieng.domain.user.dto.response;

import com.ssafy.aieng.domain.user.entity.User;
import com.ssafy.aieng.domain.user.enums.Gender;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserInfoResponse {
    private Integer userId;
    private String nickname;
    private Gender gender;
    private String birthDate;
    private String profileURL;


}