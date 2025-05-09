package com.ssafy.aieng.domain.theme.dto.response;

import com.ssafy.aieng.domain.theme.entity.Theme;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ThemeResponse {
    private String themeId;
    private String name;
    private String imageUrl;
    private Byte totalWords;
    private Byte completedWords;

    public static ThemeResponse from(Theme theme) {
        return ThemeResponse.builder()
                .themeId(theme.getThemeId())
                .name(theme.getName())
                .imageUrl(theme.getImageUrl())
                .totalWords(theme.getTotalWords())
                .completedWords(theme.getCompletedWords())
                .build();
    }
} 