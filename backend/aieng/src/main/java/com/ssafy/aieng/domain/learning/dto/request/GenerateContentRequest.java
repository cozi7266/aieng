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
    private Integer wordId;
    private String word;
}
