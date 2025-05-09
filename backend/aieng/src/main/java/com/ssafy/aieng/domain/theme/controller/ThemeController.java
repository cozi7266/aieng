package com.ssafy.aieng.domain.theme.controller;

import com.ssafy.aieng.domain.theme.service.ThemeService;
import com.ssafy.aieng.global.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import com.ssafy.aieng.domain.theme.dto.response.ThemeResponse;

@RestController
@RequestMapping("/api/themes")
@RequiredArgsConstructor
public class ThemeController {

    private final ThemeService themeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ThemeResponse>>> getThemes() {
        return ApiResponse.success(themeService.getThemes());
    }
} 