package com.ssafy.aieng.domain.book.controller;

import com.ssafy.aieng.domain.book.dto.request.StorybookCreateRequest;
import com.ssafy.aieng.domain.book.dto.response.StorybookResponse;
import com.ssafy.aieng.domain.book.service.StorybookService;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.common.util.AuthenticationUtil;
import com.ssafy.aieng.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class StorybookController {

    private final StorybookService storybookService;
    private final AuthenticationUtil authenticationUtil;

    @PostMapping("/{theme_id}")
    public ResponseEntity<ApiResponse<StorybookResponse>> createStorybook(
            @PathVariable("theme_id") Integer themeId,
            @RequestBody StorybookCreateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            // 사용자 인증 확인
            Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
            if (userId == null) {
                return ApiResponse.fail("인증되지 않은 사용자입니다.", HttpStatus.UNAUTHORIZED);
            }

            StorybookResponse response = storybookService.createStorybook(themeId, request);
            return ApiResponse.success(response);
        } catch (Exception e) {
            log.error("[Storybook Creation] 그림책 생성 실패: {}", e.getMessage(), e);
            return ApiResponse.fail("그림책을 생성하는데 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 