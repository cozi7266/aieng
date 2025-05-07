package com.ssafy.aieng.domain.theme.dto.response;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ThemeListResponse {
    private List<ThemeResponse> themes;

    public static ThemeListResponse of(List<ThemeResponse> themes) {
        return ThemeListResponse.builder()
                .themes(themes)
                .build();
    }
}