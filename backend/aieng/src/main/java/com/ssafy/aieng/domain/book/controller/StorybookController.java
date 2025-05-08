package com.ssafy.aieng.domain.book.controller;

import com.ssafy.aieng.domain.book.dto.request.StorybookCreateRequest;
import com.ssafy.aieng.domain.book.dto.response.StorybookResponse;
import com.ssafy.aieng.domain.book.service.StorybookService;
import com.ssafy.aieng.global.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/themes")
@RequiredArgsConstructor
public class StorybookController {

    private final StorybookService storybookService;

    @PostMapping("/{theme_id}/books")
    public ResponseEntity<ApiResponse<StorybookResponse>> createStorybook(
            @PathVariable("theme_id") String themeId,
            @RequestBody StorybookCreateRequest request) {
        try {
            StorybookResponse response = storybookService.createStorybook(themeId, request);
            return ApiResponse.success(response);
        } catch (Exception e) {
            log.error("[Storybook Creation] 그림책 생성 실패: {}", e.getMessage(), e);
            return ApiResponse.fail("그림책을 생성하는데 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 