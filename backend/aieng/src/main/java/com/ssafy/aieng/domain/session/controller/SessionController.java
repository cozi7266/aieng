package com.ssafy.aieng.domain.session.controller;

import com.ssafy.aieng.domain.child.service.ChildService;
import com.ssafy.aieng.domain.learning.service.LearningService;
import com.ssafy.aieng.domain.session.dto.response.SessionResponse;
import com.ssafy.aieng.domain.session.service.SessionService;
import com.ssafy.aieng.domain.theme.service.ThemeService;
import com.ssafy.aieng.domain.user.service.UserService;
import com.ssafy.aieng.domain.word.dto.response.WordResponse;
import com.ssafy.aieng.domain.word.service.WordService;
import com.ssafy.aieng.global.common.CustomPage;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/session")
public class SessionController {

    private final UserService userService;
    private final ChildService childService;
    private final ThemeService themeService;
    private final WordService wordService;
    private final SessionService sessionService;
    private final LearningService learningService;

    // 클라이언트가 테마 클릭 시 단어 순서 저장
    @PostMapping("/child/{childId}/theme/{themeId}/start")
    public ResponseEntity<ApiResponse<Void>> createSession(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Integer childId,
            @PathVariable Integer themeId
    ) {
        Integer sessionId = sessionService.createLearningSession(user.getId(), childId, themeId);
        return ApiResponse.success(HttpStatus.OK);
    }

    // 학습 세션 단건 조회
    @GetMapping("/{sessionId}")
    public ResponseEntity<ApiResponse<SessionResponse>> getSessionById(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Integer sessionId
    ) {
        SessionResponse response = sessionService.getSessionById(sessionId, user.getId());
        return ApiResponse.success(response);
    }

    // 자녀의 전체 세션 목록 조회
    @GetMapping("/child/{childId}")
    public ResponseEntity<ApiResponse<CustomPage<SessionResponse>>> getSessionsByChildPaged(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Integer childId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        CustomPage<SessionResponse> pagedResponse = sessionService.getSessionsByChildPaged(user.getId(), childId, page, size);
        return ApiResponse.success(pagedResponse);
    }

    // 자녀의 특정 세션 삭제 (Soft Delete)
    @PutMapping("/{sessionId}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateSession(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Integer sessionId
    ) {
        sessionService.softDeleteSession(sessionId, user.getId());
        return ApiResponse.success(HttpStatus.OK);
    }

    //  한 세션 내 서브세션(SessionGroup) 단위로 단어 리스트를 페이지네이션 조회
    // - 한 Session에는 여러 SessionGroup이 있음 (각 그룹은 최대 6단어)
    // - 클라이언트가 page=1 요청 시 → 첫 번째 그룹의 단어 리스트 반환
    // - 응답 형태는 CustomPage<List<WordResponse>> 형태로 그룹별 단어 묶음 제공
    @GetMapping("/{sessionId}/pages")
    public ResponseEntity<ApiResponse<CustomPage<List<WordResponse>>>> getPagedWordsBySessionGroup(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Integer sessionId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "1") int size
    ) {
        CustomPage<List<WordResponse>> result = sessionService.getPagedWordsBySessionGroup(user.getId(), sessionId, page, size);
        return ApiResponse.success(result);
    }


}
