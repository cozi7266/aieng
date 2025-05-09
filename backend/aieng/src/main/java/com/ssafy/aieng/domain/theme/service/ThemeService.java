package com.ssafy.aieng.domain.theme.service;

import com.ssafy.aieng.domain.theme.dto.response.ThemeResponse;
import java.util.List;

public interface ThemeService {
    List<ThemeResponse> getThemes();
} 