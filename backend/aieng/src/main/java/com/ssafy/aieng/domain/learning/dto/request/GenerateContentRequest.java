package com.ssafy.aieng.domain.learning.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenerateContentRequest {
    private Integer userId;
    private Integer sessionId;
    private String theme;  // themeKo 인데 일부러 수정 안함
    private String wordEn;
}
