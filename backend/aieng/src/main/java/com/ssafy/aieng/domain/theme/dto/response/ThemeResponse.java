package com.ssafy.aieng.domain.theme.dto.response;

import com.ssafy.aieng.domain.theme.entity.Theme;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ThemeResponse {
    private String themeKo;
    private String themeEn;
    private String imageUrl;
    private Byte totalWords;

    public static ThemeResponse from(Theme theme) {
        return ThemeResponse.builder()
                .themeKo(theme.getThemeKo())
                .themeEn(theme.getThemeEn())
                .imageUrl(theme.getImageUrl())
                .totalWords(theme.getTotalWords())
                .build();
    }
}
