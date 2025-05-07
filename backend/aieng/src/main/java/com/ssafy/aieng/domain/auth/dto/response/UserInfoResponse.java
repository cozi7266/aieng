package com.ssafy.aieng.domain.auth.dto.response;

import com.ssafy.aieng.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserInfoResponse {
    private String id;
    private String nickname;
    private Boolean isNew;

    // User 객체에서 정보를 바탕으로 UserInfoResponse 생성
    public static UserInfoResponse of(User user) {
        // 'isNew' 계산 로직 예시 (생성일 기준으로 최근 7일 이내 가입한 경우는 'new'로 간주)
        Boolean isNew = user.getCreatedAt().isAfter(LocalDateTime.now().minusDays(7));

        return UserInfoResponse.builder()
                .id(user.getId().toString())
                .nickname(user.getNickname())
                .isNew(isNew)  // 계산된 isNew 값
                .build();
    }
}
