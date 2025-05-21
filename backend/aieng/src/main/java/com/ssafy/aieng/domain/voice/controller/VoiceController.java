package com.ssafy.aieng.domain.voice.controller;

import com.ssafy.aieng.domain.mood.dto.MoodResponseDto;
import com.ssafy.aieng.domain.mood.service.MoodService;
import com.ssafy.aieng.domain.voice.dto.request.PronounceTestRequest;
import com.ssafy.aieng.domain.voice.dto.request.VoiceSettingRequest;
import com.ssafy.aieng.domain.voice.dto.request.VoiceUploadRequest;
import com.ssafy.aieng.domain.voice.dto.response.PronounceTestResponse;
import com.ssafy.aieng.domain.voice.dto.response.SongVoiceSettingResponse;
import com.ssafy.aieng.domain.voice.dto.response.TtsVoiceSettingResponse;
import com.ssafy.aieng.domain.voice.dto.response.VoiceResponse;
import com.ssafy.aieng.domain.voice.service.VoiceService;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.common.util.AuthenticationUtil;
import com.ssafy.aieng.global.dto.PresignedUrlDto;
import com.ssafy.aieng.global.security.UserPrincipal;
import com.ssafy.aieng.global.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.ssafy.aieng.global.dto.PresignedUrlDto;

import java.io.IOException;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/voice")
public class VoiceController {

    private final VoiceService voiceService;
    private final MoodService moodService;
    private final AuthenticationUtil authenticationUtil;
    private final S3Service s3Service;


    // 음성파일 URL 등록
    @PostMapping("/voice-url")
    public ResponseEntity<ApiResponse<Void>> registerVoiceUrl(
            @RequestHeader("X-Child-Id") Integer childId,
            @RequestBody VoiceUploadRequest dto,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        voiceService.saveVoiceUrl(userId, childId, dto);
        return ApiResponse.success(HttpStatus.CREATED);
    }


    // 특정 아이가 업로드한 목소리 + 디폴트 목소리 (남,여) 목록 조회
    @GetMapping("/child")
    public ResponseEntity<ApiResponse<List<VoiceResponse>>> getVoicesByChild(
            @RequestHeader("X-Child-Id") Integer childId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        List<VoiceResponse> responses = voiceService.getDefaultAndChildVoices(userId, childId);
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
        return ApiResponse.success(HttpStatus.OK);
    }

    // 아이의 목소리 및 분위기 설정 (TTS, 동요, Mood)
    @PatchMapping("/settings")
    public ResponseEntity<ApiResponse<Void>> updateVoiceSettings(
            @RequestHeader("X-Child-Id") Integer childId,
            @RequestBody VoiceSettingRequest request,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        voiceService.updateVoiceSettings(user.getId(), childId, request);
        return ApiResponse.success(HttpStatus.OK);
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
        List<VoiceResponse> customVoices = voiceService.getCustomVoicesByChildId(userId, childId);

        TtsVoiceSettingResponse response = new TtsVoiceSettingResponse(defaultVoices, customVoices);
        return ApiResponse.success(response);
    }

    // 발음 테스트
    @PostMapping("/pronounce-test")
    public ResponseEntity<ApiResponse<PronounceTestResponse>> getPronounceTest(
            @RequestHeader("X-Child-Id") Integer childId,
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam("expectedText") String expectedText,
            @RequestPart("audio_file") MultipartFile audioFile
    ) throws IOException {
        PronounceTestResponse response = voiceService.getPronounceTest(childId, user.getId(), expectedText, audioFile);
        return ApiResponse.success(response);
    }

    @GetMapping("/presigned-url")
    public ResponseEntity<ApiResponse<PresignedUrlDto>> getPresignedUrl(
            @RequestHeader("X-Child-Id") Integer childId,
            @RequestParam(required = false) String contentType,
            @RequestParam(required = false) Integer expires
    ) {
        PresignedUrlDto urlDto = s3Service.generatePresignedUrl(childId, contentType, expires);
        return ApiResponse.success(urlDto);
    }
} 