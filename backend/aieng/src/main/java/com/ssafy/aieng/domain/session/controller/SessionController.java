package com.ssafy.aieng.domain.session.controller;

import com.ssafy.aieng.domain.session.dto.response.ChildThemeProgressResponse;
import com.ssafy.aieng.domain.session.dto.response.CreateSessionResponse;
import com.ssafy.aieng.domain.session.service.SessionService;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;

    // 자녀의 전체 세션 목록 조회
    @GetMapping("/themes")
    public ResponseEntity<ApiResponse<List<ChildThemeProgressResponse>>> getThemesWithProgress(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestHeader("X-Child-Id") Integer childId
    ) {
        List<ChildThemeProgressResponse> result = sessionService.getAllThemesWithProgress(user.getId(), childId);
        return ApiResponse.success(result);
    }

    // 학습 세션 단건 조회
    @GetMapping("/themes/{themeId}")
    public ResponseEntity<ApiResponse<ChildThemeProgressResponse>> getThemeProgressByThemeId(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestHeader("X-Child-Id") Integer childId,
            @PathVariable Integer themeId
    ) {
        ChildThemeProgressResponse response = sessionService.getThemeProgress(user.getId(), childId, themeId);
        return ApiResponse.success(response);
    }

    // 클라이언트가 테마 클릭 시 세션 생성 (단어 6개 랜덤 저장)
    @PostMapping("/themes/{themeId}/start")
    public ResponseEntity<ApiResponse<CreateSessionResponse>> createSession(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestHeader("X-Child-Id") Integer childId,
            @PathVariable Integer themeId
    ) {
        CreateSessionResponse response = sessionService.createLearningSession(user.getId(), childId, themeId);
        return ApiResponse.success(response);
    }


    // 자녀의 특정 세션 삭제 (Soft Delete)
    @PutMapping("/{sessionId}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateSession(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestHeader("X-Child-Id") Integer childId,
            @PathVariable Integer sessionId
    ) {
        sessionService.softDeleteSession(sessionId, user.getId());
        return ApiResponse.success(HttpStatus.OK);
    }
}
