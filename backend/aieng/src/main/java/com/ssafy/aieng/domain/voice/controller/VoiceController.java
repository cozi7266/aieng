package com.ssafy.aieng.domain.voice.controller;

import com.ssafy.aieng.domain.mood.dto.MoodResponseDto;
import com.ssafy.aieng.domain.mood.entity.Mood;
import com.ssafy.aieng.domain.mood.service.MoodService;
import com.ssafy.aieng.domain.voice.dto.request.VoiceCreateRequest;
import com.ssafy.aieng.domain.voice.dto.request.VoiceSettingRequest;
import com.ssafy.aieng.domain.voice.dto.response.SongVoiceSettingResponse;
import com.ssafy.aieng.domain.voice.dto.response.TtsVoiceSettingResponse;
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
    private final MoodService moodService;
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

    // 아이의 목소리 및 분위기 설정 (TTS, 동요, Mood)
    @PatchMapping("/settings")
    public ResponseEntity<ApiResponse<Void>> updateVoiceSettings(
            @RequestHeader("X-Child-Id") Integer childId,
            @RequestBody VoiceSettingRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        voiceService.updateVoiceSettings(userId, childId, request);
        return ApiResponse.success(null);
    }


    // 동요 세팅 조회
    @GetMapping("/song-settings")
    public ResponseEntity<ApiResponse<SongVoiceSettingResponse>> getSongSettings(
            @RequestHeader("X-Child-Id") Integer childId,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        List<MoodResponseDto> moods = moodService.getAllMoods(user.getId(), childId);

        // ID 1: 남성, ID 2: 여성 목소리라고 가정
        VoiceResponse maleVoice = voiceService.getVoiceById(1);
        VoiceResponse femaleVoice = voiceService.getVoiceById(2);

        List<VoiceResponse> voices = List.of(maleVoice, femaleVoice);
        SongVoiceSettingResponse response = new SongVoiceSettingResponse(moods, voices);
        return ApiResponse.success(response);
    }

    // tts 세팅
    @GetMapping("/tts-settings")
    public ResponseEntity<ApiResponse<TtsVoiceSettingResponse>> getTtsSettings(
            @RequestHeader("X-Child-Id") Integer childId,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        Integer userId = authenticationUtil.getCurrentUserId(user);

        // 기본 남/여 목소리 (ID 1, 2)
        VoiceResponse maleVoice = voiceService.getVoiceById(1);
        VoiceResponse femaleVoice = voiceService.getVoiceById(2);
        List<VoiceResponse> defaultVoices = List.of(maleVoice, femaleVoice);

        // 자녀가 업로드한 커스텀 목소리
        List<VoiceResponse> customVoices = voiceService.getVoicesByChildId(userId, childId);

        TtsVoiceSettingResponse response = new TtsVoiceSettingResponse(defaultVoices, customVoices);
        return ApiResponse.success(response);
    }


} 