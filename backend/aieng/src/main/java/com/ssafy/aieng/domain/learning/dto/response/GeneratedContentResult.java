package com.ssafy.aieng.domain.learning.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
@JsonIgnoreProperties(ignoreUnknown = true)
public class GeneratedContentResult {

    @JsonProperty("word")
    private String word;

    @JsonProperty("sentence")
    private String sentence;

    @JsonProperty("translation")
    private String translation;

    @JsonProperty("image_url")
    private String imageUrl;

    @JsonProperty("audio_url")
    private String audioUrl;


}
