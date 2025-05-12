package com.ssafy.aieng.domain.learning.dto.request;

import lombok.Getter;

@Getter
public class GenerateContentRequest {
    private Integer childId;
    private Integer themeId;
    private Integer wordId;
    private String word;
}
