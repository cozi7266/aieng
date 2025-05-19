package com.ssafy.aieng.domain.voice.controller;

import com.ssafy.aieng.domain.voice.dto.request.VoiceCreateRequest;
import com.ssafy.aieng.domain.voice.dto.response.VoiceResponse;
import com.ssafy.aieng.domain.voice.service.VoiceService;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.common.util.AuthenticationUtil;
import com.ssafy.aieng.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/voice")
public class VoiceController {

    private final VoiceService voiceService;
    private final AuthenticationUtil authenticationUtil;

    // 목소리 파일 S3에 저장
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<VoiceResponse>> createVoice(
            @RequestHeader("X-Child-Id") Integer childId,
            @ModelAttribute VoiceCreateRequest request,  // Multipart 포함 DTO
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        VoiceResponse response = voiceService.createVoice(userId, childId, request);
        return ApiResponse.success(response);
    }

    // 목소리 목록 조회(디폴트 + 사용자 목소리)
    @GetMapping("/default")
    public ResponseEntity<ApiResponse<List<VoiceResponse>>> getVoices(
            @RequestHeader("X-Child-Id") Integer childId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        List<VoiceResponse> responses = voiceService.getDefaultVoices();
        return ApiResponse.success(responses);
    }

    // 특정 아이가 업로드한 목소리 목록 조회
    @GetMapping("/child")
    public ResponseEntity<ApiResponse<List<VoiceResponse>>> getVoicesByChild(
            @RequestHeader("X-Child-Id") Integer childId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        List<VoiceResponse> responses = voiceService.getVoicesByChildId(userId, childId);
        return ApiResponse.success(responses);
    }

    // 목소리 상세 조회
    @GetMapping("/{voiceId}")
    public ResponseEntity<ApiResponse<VoiceResponse>> getVoiceDetail(
            @PathVariable Integer voiceId,
            @RequestHeader("X-Child-Id") Integer childId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        VoiceResponse response = voiceService.getVoiceDetail(userId, childId, voiceId);
        return ApiResponse.success(response);
    }

    // 목소리 삭제
    @DeleteMapping("/{voiceId}")
    public ResponseEntity<ApiResponse<Void>> deleteVoice(
            @PathVariable Integer voiceId,
            @RequestHeader("X-Child-Id") Integer childId,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        voiceService.deleteVoice(user.getId(), childId, voiceId);
        return ApiResponse.success(null);
    }


} 