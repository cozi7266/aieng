package com.ssafy.aieng.domain.theme.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ThemeResponse {
    @JsonProperty("theme_id")
    private String themeId;
    
    private String name;
    
    private String image;
    
    private String progress;

    public static ThemeResponse of(String themeId, String name, String image, int completedWords, int totalWords) {
        return ThemeResponse.builder()
                .themeId(themeId)
                .name(name)
                .image(image)
                .progress(completedWords + "/" + totalWords)
                .build();
    }
} 