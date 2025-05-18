package com.ssafy.aieng.domain.learning.controller;


import com.ssafy.aieng.domain.learning.dto.response.GeneratedContentResult;
import com.ssafy.aieng.domain.learning.dto.response.LearningSessionDetailResponse;
import com.ssafy.aieng.domain.learning.dto.response.SentenceResponse;
import com.ssafy.aieng.domain.learning.service.LearningService;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/learning")
public class LearningController {

    private final LearningService learningService;

    // 특정 세션에 포함된 학습 단어 전체 조회 (6개 고정)
    @GetMapping("/sessions/{sessionId}/words")
    public ResponseEntity<ApiResponse<LearningSessionDetailResponse>> getLearningSessionDetail(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestHeader("X-Child-Id") Integer childId,
            @PathVariable Integer sessionId
    ) {
        LearningSessionDetailResponse response = learningService.getLearningSessionDetail(user.getId(), childId, sessionId);
        return ApiResponse.success(response);
    }

    // fastapi 요청 및 응답 그리고 학습완료
    @PostMapping("/sessions/{sessionId}/words/{wordEn}/generation")
    public ResponseEntity<ApiResponse<GeneratedContentResult>> requestAndSaveGeneration(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestHeader("X-Child-Id") Integer childId,
            @PathVariable Integer sessionId,
            @PathVariable String wordEn
    ) {
        GeneratedContentResult result = learningService.sendRequestAndSave(user.getId(), childId, sessionId, wordEn);
        return ApiResponse.success(result);
    }

    // 아이가 생성한 문장 정보 반환
    @GetMapping("/sessions/{sessionId}/words/{word}/sentence")
    public ResponseEntity<ApiResponse<SentenceResponse>> getGeneratedSentence(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestHeader("X-Child-Id") Integer childId,
            @PathVariable Integer sessionId,
            @PathVariable String word
    ) {
        SentenceResponse sentenceResponse = learningService.getSentenceResponse(user.getId(), sessionId, word);
        return ApiResponse.success(sentenceResponse);
    }
}
