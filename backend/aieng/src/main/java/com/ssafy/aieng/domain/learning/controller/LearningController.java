package com.ssafy.aieng.domain.learning.controller;


import com.ssafy.aieng.domain.child.service.ChildService;
import com.ssafy.aieng.domain.learning.dto.response.GeneratedContentResult;
import com.ssafy.aieng.domain.learning.dto.response.LearningWordResponse;
import com.ssafy.aieng.domain.learning.dto.response.SentenceResponse;
import com.ssafy.aieng.domain.learning.dto.response.ThemeProgressResponse;
import com.ssafy.aieng.domain.learning.service.LearningService;
import com.ssafy.aieng.global.common.CustomPage;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.common.util.AuthenticationUtil;
import com.ssafy.aieng.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


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


    /**
     * [1단계] AI 문장 생성 요청 전송 (FastAPI)
     *
     * 주어진 sessionId와 word를 기반으로 FastAPI에 생성 요청을 보냅니다.
     * - 요청만 전송하며, 결과는 Redis에 비동기로 저장됨
     * - 클라이언트는 이후 polling으로 결과를 확인해야 함
     */
    @PostMapping("/generate/request/{sessionId}/{word}")
    public ResponseEntity<ApiResponse<Void>> requestWordContent(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Integer sessionId,
            @PathVariable String word
    ) {
        learningService.sendFastApiRequest(user.getId(), sessionId, word);
        return ApiResponse.success(HttpStatus.OK);
    }

    /**
     * [2단계] 생성된 결과 조회 및 자동 저장
     *
     * Redis에서 FastAPI가 저장한 결과를 조회하고,
     * 아직 Learning 테이블에 저장되지 않은 경우 자동으로 저장합니다.
     * - 이미 저장된 학습 데이터인 경우 저장은 생략됨
     * - 프론트는 이 API만 polling 하면서 결과를 가져오면 됨
     */
    @GetMapping("/generate/result/{sessionId}/{word}")
    public ResponseEntity<ApiResponse<GeneratedContentResult>> getGeneratedResultAndSave(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Integer sessionId,
            @PathVariable String word
    ) {
        GeneratedContentResult result = learningService.getAndSaveGeneratedResult(user.getId(), sessionId, word);
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
