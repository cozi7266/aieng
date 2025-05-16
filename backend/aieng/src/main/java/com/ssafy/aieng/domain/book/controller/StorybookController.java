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

    // 그림책  생성
    @PostMapping("/sessions/{sessionId}/storybook")
    public ResponseEntity<ApiResponse<StorybookResponse>> createStorybook(
            @PathVariable Integer sessionId,
            @RequestHeader("X-Child-Id") Integer childId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Integer userId = userPrincipal.getId();

        StorybookResponse response = storybookService.createStorybook(userId, childId, sessionId);

        return ApiResponse.success(response);
    }

} 