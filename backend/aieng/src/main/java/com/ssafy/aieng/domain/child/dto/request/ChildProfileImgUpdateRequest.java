package com.ssafy.aieng.domain.child.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChildProfileImgUpdateRequest {

    private String childImgUrl;

}
