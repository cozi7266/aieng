package com.ssafy.aieng.domain.learning.controller;

import com.ssafy.aieng.domain.child.service.ChildService;
import com.ssafy.aieng.domain.learning.repository.SessionRepository;
import com.ssafy.aieng.domain.learning.service.LearningService;
import com.ssafy.aieng.domain.learning.service.SessionService;
import com.ssafy.aieng.domain.theme.service.ThemeService;
import com.ssafy.aieng.domain.user.service.UserService;
import com.ssafy.aieng.domain.word.service.WordService;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

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

}
