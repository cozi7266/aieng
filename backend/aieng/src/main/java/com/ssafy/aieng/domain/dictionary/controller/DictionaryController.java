package com.ssafy.aieng.domain.dictionary.controller;

import com.ssafy.aieng.domain.dictionary.dto.response.DictionaryDetailResponse;
import com.ssafy.aieng.domain.dictionary.dto.response.DictionaryThemesResponse;
import com.ssafy.aieng.domain.dictionary.service.DictionaryService;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.common.util.AuthenticationUtil;
import com.ssafy.aieng.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dictionaries")
public class DictionaryController {

    private final DictionaryService dictionaryService;
    private final AuthenticationUtil authenticationUtil;

    //  학습도감 내 전체 테마 조회
    @GetMapping("/themes")
    public ResponseEntity<ApiResponse<List<DictionaryThemesResponse>>> getThemesWithProgress(
            @RequestHeader("X-Child-Id") Integer childId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);

        List<DictionaryThemesResponse> response = dictionaryService.getThemesWithProgress(childId, userId);

        return ApiResponse.success(response);
    }



    // 단어도감의 특정 테마의 단어 목록 조회 (자녀 기준)
    @GetMapping("/themes/{themeId}/words")
    public ResponseEntity<ApiResponse<List<DictionaryDetailResponse>>> getWordsByTheme(
            @RequestHeader("X-Child-Id") Integer childId,
            @PathVariable Integer themeId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);

        List<DictionaryDetailResponse> response = dictionaryService.getWordsByTheme(childId, themeId, userId);

        return ApiResponse.success(response);
    }

}
