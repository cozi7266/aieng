package com.ssafy.aieng.domain.theme.dto.response;

import com.ssafy.aieng.domain.theme.entity.Theme;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ThemeResponse {
    private String themeName;
    private String imageUrl;
    private Byte totalWords;

    public static ThemeResponse from(Theme theme) {
        return ThemeResponse.builder()
                .themeName(theme.getThemeName())
                .imageUrl(theme.getImageUrl())
                .totalWords(theme.getTotalWords())
                .build();
    }
}
