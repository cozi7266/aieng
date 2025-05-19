package com.ssafy.aieng.domain.book.controller;

import com.ssafy.aieng.domain.book.dto.request.StorybookCreateRequest;
import com.ssafy.aieng.domain.book.dto.response.StorybookListResponse;
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

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class StorybookController {

    private final StorybookService storybookService;

//    // 그림책 생성
//    @PostMapping("/sessions/{sessionId}/storybook")
//    public ResponseEntity<ApiResponse<StorybookResponse>> createStorybook(
//            @PathVariable Integer sessionId,
//            @RequestHeader("X-Child-Id") Integer childId,
//            @AuthenticationPrincipal UserPrincipal userPrincipal) {
//
//        Integer userId = userPrincipal.getId();
//
//        StorybookResponse response = storybookService.createStorybook(userId, childId, sessionId);
//
//        return ApiResponse.success(response);
//    }

    // 그림책 목록 조회
    @GetMapping
    public ResponseEntity<ApiResponse<List<StorybookListResponse>>> getStorybooksByChild(
            @RequestHeader("X-Child-Id") Integer childId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Integer userId = userPrincipal.getId();
        List<StorybookListResponse> response = storybookService.getStorybooksByChild(userId, childId);
        return ApiResponse.success(response);
    }

    // 그림책 상세 조회
    @GetMapping("/{storybookId}")
    public ResponseEntity<ApiResponse<StorybookResponse>> getStorybookDetail(
            @PathVariable Integer storybookId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Integer userId = userPrincipal.getId();
        StorybookResponse response = storybookService.getStorybookDetail(userId, storybookId);
        return ApiResponse.success(response);
    }

    // 4. 그림책 삭제
    @DeleteMapping("/{storybookId}")
    public ResponseEntity<ApiResponse<Void>> deleteStorybook(
            @PathVariable Integer storybookId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Integer userId = userPrincipal.getId();
        storybookService.deleteStorybook(userId, storybookId);
        return ApiResponse.success(HttpStatus.NO_CONTENT);
    }

} 