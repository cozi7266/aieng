package com.ssafy.aieng.domain.child.dto.response;

import com.ssafy.aieng.domain.child.entity.Child;
import com.ssafy.aieng.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class ChildInfoResponse {

    private Integer userId;
    private Integer childId;
    private String childName;
    private String childGender;
    private LocalDate childBirthday;

    public static ChildInfoResponse of(User User, Child child) {
        return new ChildInfoResponse(
                User.getId(),
                child.getId(),
                child.getName(),
                child.getGender().toString(),
                child.getBirthdate()
        );
    }
}
