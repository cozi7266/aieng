package com.ssafy.aieng.domain.learning.controller;

import com.ssafy.aieng.domain.child.service.ChildService;
import com.ssafy.aieng.domain.learning.dto.response.LearningWordResponse;
import com.ssafy.aieng.domain.learning.dto.response.ThemeProgressResponse;
import com.ssafy.aieng.domain.learning.entity.Learning;
import com.ssafy.aieng.domain.learning.service.LearningService;
import com.ssafy.aieng.global.common.CustomPage;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.common.util.AuthenticationUtil;
import com.ssafy.aieng.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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
            Pageable pageable
    ) {
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

    @GetMapping("/{childId}/theme/{themeId}/words")
    public ResponseEntity<ApiResponse<CustomPage<LearningWordResponse>>> getLearningWordsByTheme(
            @PathVariable Integer childId,
            @PathVariable Integer themeId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable
    ) {
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

}
