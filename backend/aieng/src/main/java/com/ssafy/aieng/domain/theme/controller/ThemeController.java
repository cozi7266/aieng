package com.ssafy.aieng.domain.theme.controller;

import com.ssafy.aieng.domain.theme.service.ThemeService;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.common.util.AuthenticationUtil;
import com.ssafy.aieng.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    private final AuthenticationUtil authenticationUtil;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ThemeResponse>>> getThemes(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            // 사용자 인증 확인
            Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
            if (userId == null) {
                return ApiResponse.fail("인증되지 않은 사용자입니다.", HttpStatus.UNAUTHORIZED);
            }

            return ApiResponse.success(themeService.getThemes());
        } catch (Exception e) {
            return ApiResponse.fail("테마 목록을 가져오는데 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 