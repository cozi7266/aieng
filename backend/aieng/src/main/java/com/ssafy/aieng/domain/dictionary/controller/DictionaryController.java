package com.ssafy.aieng.domain.dictionary.controller;

import com.ssafy.aieng.domain.dictionary.dto.DictionaryResponse;
import com.ssafy.aieng.domain.dictionary.dto.DictionaryDetailResponse;
import com.ssafy.aieng.domain.dictionary.service.DictionaryService;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.common.util.AuthenticationUtil;
import com.ssafy.aieng.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dictionary")
public class DictionaryController {

    private final DictionaryService dictionaryService;
    private final AuthenticationUtil authenticationUtil;

    @GetMapping("/{childId}")
    public ResponseEntity<ApiResponse<List<DictionaryResponse>>> getDictionaryByChildId(
            @PathVariable Integer childId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("[DictionaryController] getDictionaryByChildId called - childId: {}, userId: {}", 
                childId, userPrincipal != null ? userPrincipal.getId() : "null");
        
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        log.info("[DictionaryController] Authenticated userId: {}", userId);
        
        List<DictionaryResponse> response = dictionaryService.getDictionaryByChildId(childId, userId);
        return ApiResponse.success(response);
    }

    @GetMapping("/{childId}/word/{wordId}")
    public ResponseEntity<ApiResponse<DictionaryDetailResponse>> getDictionaryDetail(
            @PathVariable Integer childId,
            @PathVariable Integer wordId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("[DictionaryController] getDictionaryDetail called - childId: {}, wordId: {}, userId: {}", 
                childId, wordId, userPrincipal != null ? userPrincipal.getId() : "null");
        
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        log.info("[DictionaryController] Authenticated userId: {}", userId);
        
        DictionaryDetailResponse response = dictionaryService.getDictionaryDetail(childId, wordId, userId);
        return ApiResponse.success(response);
    }
} 