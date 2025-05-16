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
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/songs")
@RequiredArgsConstructor
public class SongController {

    private final SongService songService;
    private final MoodService moodService;
    private final VoiceService voiceService;

    @PostMapping
    public ResponseEntity<ApiResponse<SongGenerateResponseDto>> generateSong(@RequestBody SongGenerateRequestDto requestDto) {
        try {
            SongGenerateResponseDto response = songService.generateSong(requestDto);
            return ApiResponse.success(response);
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
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

    @GetMapping("/{songId}")
    public ResponseEntity<ApiResponse<SongDetailResponseDto>> getSongDetail(@PathVariable Integer songId) {
        try {
            SongDetailResponseDto response = songService.getSongDetail(songId);
            return ApiResponse.success(response);
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SongListResponseDto>>> getSongList() {
        List<SongListResponseDto> response = songService.getSongList();
        return ApiResponse.success(response);
    }


    @PutMapping("/{songId}/delete")
    public ResponseEntity<ApiResponse<Void>> deleteSong(@PathVariable Integer songId) {
        try {
            songService.deleteSong(songId);
            return ApiResponse.success(null, HttpStatus.OK);
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }
} 