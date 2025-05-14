package com.ssafy.aieng.domain.learning.controller;

import com.ssafy.aieng.domain.child.service.ChildService;
import com.ssafy.aieng.domain.learning.dto.response.GeneratedContentResult;
import com.ssafy.aieng.domain.learning.dto.response.SentenceResponse;
import com.ssafy.aieng.domain.learning.service.LearningService;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.common.util.AuthenticationUtil;
import com.ssafy.aieng.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/learning")
public class LearningController {

    private final LearningService learningService;
    private final ChildService childService;
    private final AuthenticationUtil authenticationUtil;
    private final RedisTemplate<String, Object> redisTemplate;


    /**
     * [1단계] AI 문장 생성 요청 전송 (FastAPI)
     *
     * 주어진 sessionId와 word를 기반으로 FastAPI에 생성 요청을 보냅니다.
     * - 요청만 전송하며, 결과는 Redis에 비동기로 저장됨
     * - 클라이언트는 이후 polling으로 결과를 확인해야 함
     */
    @PostMapping("/sessions/{sessionId}/words/{wordEn}/generation")
    public ResponseEntity<ApiResponse<Void>> requestGeneration(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Integer sessionId,
            @PathVariable String wordEn
    ) {
        learningService.sendFastApiRequest(user.getId(), sessionId, wordEn);
        return ApiResponse.success(null);
    }

    /**
     * [2단계] 생성된 결과 조회 및 자동 저장
     *
     * Redis에서 FastAPI가 저장한 결과를 조회하고,
     * 아직 Learning 테이블에 저장되지 않은 경우 자동으로 저장합니다.
     * - 이미 저장된 학습 데이터인 경우 저장은 생략됨
     * - 프론트는 이 API만 polling 하면서 결과를 가져오면 됨
     */
    @GetMapping("/sessions/{sessionId}/words/{word}/generation")
    public ResponseEntity<ApiResponse<GeneratedContentResult>> pollGeneratedResult(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Integer sessionId,
            @PathVariable String word
    ) {
        GeneratedContentResult result = learningService.getAndSaveGeneratedResult(user.getId(), sessionId, word);
        return ApiResponse.success(result);
    }


    // 아이가 생성한 문장 정보 반환
    @GetMapping("/sessions/{sessionId}/words/{word}/sentence")
    public ResponseEntity<ApiResponse<SentenceResponse>> getGeneratedSentence(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Integer sessionId,
            @PathVariable String word
    ) {
        SentenceResponse sentenceResponse = learningService.getSentenceResponse(user.getId(), sessionId, word);
        return ApiResponse.success(sentenceResponse);
    }




}
