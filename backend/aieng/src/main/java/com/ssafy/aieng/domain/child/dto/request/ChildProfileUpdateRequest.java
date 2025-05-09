package com.ssafy.aieng.domain.child.dto.request;

import com.ssafy.aieng.domain.user.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChildProfileUpdateRequest {

    private String childName;
    private Gender childGender;
    private LocalDate childBirthdate;
    private String childImgUrl;

}
