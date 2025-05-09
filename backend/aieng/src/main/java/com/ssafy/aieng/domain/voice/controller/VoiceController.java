package com.ssafy.aieng.domain.voice.controller;

import com.ssafy.aieng.domain.voice.dto.request.VoiceCreateRequest;
import com.ssafy.aieng.domain.voice.dto.response.VoiceResponse;
import com.ssafy.aieng.domain.voice.service.VoiceService;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.common.util.AuthenticationUtil;
import com.ssafy.aieng.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/songs/voice")
public class VoiceController {

    private final VoiceService voiceService;
    private final AuthenticationUtil authenticationUtil;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<VoiceResponse>> createVoice(
            @RequestParam("childId") Integer childId,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("audioFile") MultipartFile audioFile,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        try {
            // 사용자 인증 확인
            Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
            if (userId == null) {
                return ApiResponse.fail("인증되지 않은 사용자입니다.", HttpStatus.UNAUTHORIZED);
            }

            VoiceCreateRequest request = new VoiceCreateRequest();
            request.setChildId(childId);
            request.setName(name);
            request.setDescription(description);
            request.setAudioFile(audioFile);

            VoiceResponse response = voiceService.createVoice(request);
            return ApiResponse.success(response);
        } catch (Exception e) {
            return ApiResponse.fail("음성 파일 업로드에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 