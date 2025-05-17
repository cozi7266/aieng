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

//    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public ResponseEntity<ApiResponse<VoiceResponse>> createVoice(
//            @RequestParam("childId") Integer childId,
//            @RequestParam("name") String name,
//            @RequestParam(value = "description", required = false) String description,
//            @RequestParam("audioFile") MultipartFile audioFile,
//            @AuthenticationPrincipal UserPrincipal userPrincipal) {
//
//        try {
//            // 사용자 인증 확인
//            Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
//            if (userId == null) {
//                return ApiResponse.fail("인증되지 않은 사용자입니다.", HttpStatus.UNAUTHORIZED);
//            }
//
//            VoiceCreateRequest request = new VoiceCreateRequest();
//            request.setChildId(childId);
//            request.setName(name);
//            request.setDescription(description);
//            request.setAudioFile(audioFile);
//
//            VoiceResponse response = voiceService.createVoice(request);
//            return ApiResponse.success(response);
//        } catch (Exception e) {
//            log.error("[Voice Creation] 음성 파일 업로드 실패: {}", e.getMessage(), e);
//            return ApiResponse.fail("음성 파일 업로드에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
//        }
//    }

    @GetMapping("/{voiceId}")
    public ResponseEntity<ApiResponse<VoiceResponse>> getVoice(
            @PathVariable Integer voiceId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            // 사용자 인증 확인
            Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
            if (userId == null) {
                return ApiResponse.fail("인증되지 않은 사용자입니다.", HttpStatus.UNAUTHORIZED);
            }

            VoiceResponse response = voiceService.getVoice(voiceId);
            return ApiResponse.success(response);
        } catch (Exception e) {
            log.error("[Voice Retrieval] 음성 파일 조회 실패: {}", e.getMessage(), e);
            return ApiResponse.fail("음성 파일을 조회하는데 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/child/{childId}")
    public ResponseEntity<ApiResponse<List<VoiceResponse>>> getVoicesByChild(
            @PathVariable Integer childId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            // 사용자 인증 확인
            Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
            if (userId == null) {
                return ApiResponse.fail("인증되지 않은 사용자입니다.", HttpStatus.UNAUTHORIZED);
            }

            List<VoiceResponse> responses = voiceService.getVoicesByChildId(childId);
            return ApiResponse.success(responses);
        } catch (Exception e) {
            log.error("[Voice List Retrieval] 음성 파일 목록 조회 실패: {}", e.getMessage(), e);
            return ApiResponse.fail("음성 파일 목록을 조회하는데 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 