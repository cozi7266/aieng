package com.ssafy.aieng.domain.learning.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.aieng.domain.child.service.ChildService;
import com.ssafy.aieng.domain.learning.dto.response.GeneratedContentResult;
import com.ssafy.aieng.domain.learning.dto.response.LearningWordResponse;
import com.ssafy.aieng.domain.learning.dto.response.SentenceResponse;
import com.ssafy.aieng.domain.learning.dto.response.ThemeProgressResponse;
import com.ssafy.aieng.domain.learning.entity.Learning;
import com.ssafy.aieng.domain.learning.service.LearningService;
import com.ssafy.aieng.global.common.CustomPage;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.common.util.AuthenticationUtil;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.ssafy.aieng.domain.learning.dto.request.GenerateContentRequest;
import com.ssafy.aieng.domain.learning.dto.request.SaveHistorytRequest;
import org.springframework.web.client.RestTemplate;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/learning")
public class LearningController {

    private final LearningService learningService;
    private final ChildService childService;
    private final AuthenticationUtil authenticationUtil;
    private final RedisTemplate<String, Object> redisTemplate;

    // 아이별 테마 조회(학습한 단어수도 같이 조회)
    @GetMapping("/{childId}/theme-progress")
    public ResponseEntity<ApiResponse<CustomPage<ThemeProgressResponse>>> getThemeProgressByChildId(
            @PathVariable Integer childId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable) {
        String cacheKey = "themeProgress:" + userPrincipal.getId() + ":" + childId + ":" + pageable.getPageNumber() + ":" + pageable.getPageSize();

        // 캐시가 있으면 그거 리턴
        CustomPage<ThemeProgressResponse> cached = (CustomPage<ThemeProgressResponse>) redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return ApiResponse.success(cached);
        }

        // 없으면 DB 조회 후 캐시에 저장
        CustomPage<ThemeProgressResponse> progressPage = learningService.getThemeProgressByChildIdForParent(childId, userPrincipal.getId(), pageable);
        redisTemplate.opsForValue().set(cacheKey, progressPage);

        return ApiResponse.success(progressPage);
    }

    // 테마 접속 후 단어 조회
    @GetMapping("child/{childId}/theme/{themeId}/words")
    public ResponseEntity<ApiResponse<CustomPage<LearningWordResponse>>> getLearningWordsByTheme(
            @PathVariable Integer childId,
            @PathVariable Integer themeId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable) {
        String cacheKey = String.format("learning:%d:%d:%d:%d:%d",
                userPrincipal.getId(), childId, themeId,
                pageable.getPageNumber(), pageable.getPageSize());

        // Redis 캐시 확인
        CustomPage<LearningWordResponse> cached =
                (CustomPage<LearningWordResponse>) redisTemplate.opsForValue().get(cacheKey);

        if (cached != null) {
            return ApiResponse.success(cached);
        }

        // 없으면 DB 조회 + 캐시 저장
        CustomPage<LearningWordResponse> result =
                learningService.getOrCreateLearningSession(childId, themeId, userPrincipal.getId(), pageable);

        redisTemplate.opsForValue().set(cacheKey, result);

        return ApiResponse.success(result);
    }

    // 아이의 문장과 문장 이미지를 생성하기 위한 기능
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<GeneratedContentResult>> generateWordContent(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody GenerateContentRequest request
    ) {
        // 유저 검증 또는 요청에 포함된 유저 ID 대조 가능
        GeneratedContentResult result = learningService.generateAndSaveWordContent(
                userPrincipal.getId(), request
        );
        return ApiResponse.success(result);
    }

    // 아이가 생성한 문장 정보 반환
    @GetMapping("/child/{childId}/words/{wordId}/sentence")
    public ResponseEntity<ApiResponse<SentenceResponse>> getSentenceTTS(
            @PathVariable Integer childId,
            @PathVariable Integer wordId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Integer userId = userPrincipal.getId();

        SentenceResponse sentenceResponse = learningService.getSentenceResponse(userId, childId, wordId);

        return ApiResponse.success(sentenceResponse);
    }


//    // 1. Redis에 학습 상태 임시 저장
//    @PostMapping("/progress/save")
//    public ResponseEntity<ApiResponse<String>> saveLearningProgress(
//            @RequestBody SaveHistorytRequest request,
//            @AuthenticationPrincipal UserPrincipal userPrincipal
//    ) {
//        Integer userId = userPrincipal.getId();
//        request.setUserId(userId);
//        learningService.saveProgressToRedis(request);
//        return ApiResponse.success("Saved to Redis");
//    }

    // 2. Redis -> DB 반영
    @PostMapping("/child/{childId}/session/{sessionId}/persist")
    public ResponseEntity<ApiResponse<String>> persistProgressToDb(
            @PathVariable Integer childId,
            @PathVariable Integer sessionId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Integer userId = userPrincipal.getId();
        learningService.persistProgressFromRedis(userId, childId, sessionId);
        return ApiResponse.success("Saved to DB");
    }




}
