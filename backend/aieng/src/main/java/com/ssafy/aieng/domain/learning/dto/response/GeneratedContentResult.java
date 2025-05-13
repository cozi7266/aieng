package com.ssafy.aieng.domain.learning.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
public class GeneratedContentResult {

    @JsonProperty("word")
    private String word;

    @JsonProperty("sentence")
    private String sentence;

    @JsonProperty("image_url")
    private String imageUrl;

    @JsonProperty("audio_url")
    private String audioUrl;

    @JsonProperty("cached_at")
    private String cachedAt;
}
