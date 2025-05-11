package com.ssafy.aieng.domain.learning.dto.response;

import lombok.Getter;

@Getter
public class GeneratedContentResult {
    private String word;
    private String sentence;
    private String imageUrl;
    private String audioUrl;
    private String cachedAt;
}
