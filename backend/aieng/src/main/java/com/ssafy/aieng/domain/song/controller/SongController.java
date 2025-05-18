package com.ssafy.aieng.domain.song.controller;

import com.ssafy.aieng.domain.mood.dto.MoodResponseDto;
import com.ssafy.aieng.domain.mood.service.MoodService;
import com.ssafy.aieng.domain.song.dto.request.SongGenerateRequestDto;
import com.ssafy.aieng.domain.song.dto.response.SongGenerateResponseDto;
import com.ssafy.aieng.domain.song.dto.response.SongListResponseDto;
import com.ssafy.aieng.domain.song.dto.response.SongDetailResponseDto;
import com.ssafy.aieng.domain.song.service.SongService;
import com.ssafy.aieng.domain.voice.dto.VoiceResponseDto;
import com.ssafy.aieng.domain.voice.service.VoiceService;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/songs")
@RequiredArgsConstructor
public class SongController {

    private final SongService songService;
    private final MoodService moodService;
    private final VoiceService voiceService;

    // 동요 생성 요청(FastAPI로 요청만)
    @PostMapping("/sessions/{sessionId}/generate-song")
    public ResponseEntity<ApiResponse<Void>> generateSongRequest(
            @RequestBody SongGenerateRequestDto requestDto,
            @AuthenticationPrincipal UserPrincipal user,
            @RequestHeader("X-Child-Id") Integer childId,
            @PathVariable Integer sessionId
    ) {
        songService.generateSong(user.getId(), childId, sessionId, requestDto);
        return ApiResponse.success(HttpStatus.OK);
    }

    // 동요 (Redis -> RDB 저장)
    @GetMapping("/sessions/{sessionId}/storybooks/{storybookId}/save-song")
    public ResponseEntity<ApiResponse<SongGenerateResponseDto>> getGeneratedSongFromRedis(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestHeader("X-Child-Id") Integer childId,
            @PathVariable Integer sessionId,
            @PathVariable Integer storybookId

    ) {
        SongGenerateResponseDto response = songService.getGeneratedSong(user.getId(), childId, sessionId, storybookId);
        return ApiResponse.success(response);
    }




    @GetMapping("/voice")
    public ResponseEntity<ApiResponse<List<VoiceResponseDto>>> getDefaultVoices() {
        List<VoiceResponseDto> response = voiceService.getDefaultVoices();
        return ApiResponse.success(response);
    }

    @GetMapping("/mood")
    public ResponseEntity<ApiResponse<List<MoodResponseDto>>> getMoodList() {
        List<MoodResponseDto> response = moodService.getAllMoods();
        return ApiResponse.success(response);
    }


}