package com.ssafy.aieng.domain.mood.controller;

import com.ssafy.aieng.domain.mood.dto.MoodResponseDto;
import com.ssafy.aieng.domain.mood.service.MoodService;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/moods")
@RequiredArgsConstructor
public class MoodController {

    private final MoodService moodService;

    // 분위기 전체 목록 조회
    @GetMapping
    public ResponseEntity<ApiResponse<List<MoodResponseDto>>> getAllMoods(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestHeader("X-Child-Id") Integer childId
    ) {
        List<MoodResponseDto> moods = moodService.getAllMoods(user.getId(), childId);
        return ApiResponse.success(moods);
    }

    // 분위기 단건 조회
    @GetMapping("/{moodId}")
    public ResponseEntity<ApiResponse<MoodResponseDto>> getMood(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestHeader("X-Child-Id") Integer childId,
            @PathVariable Integer moodId
    ) {
        MoodResponseDto mood = moodService.getMood(user.getId(), childId, moodId);
        return ApiResponse.success(mood);
    }

}

