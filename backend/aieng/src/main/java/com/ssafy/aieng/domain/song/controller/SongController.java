package com.ssafy.aieng.domain.song.controller;

import com.ssafy.aieng.domain.mood.service.MoodService;
import com.ssafy.aieng.domain.song.dto.response.SongDetailResponseDto;
import com.ssafy.aieng.domain.song.dto.response.SongGenerateResponseDto;
import com.ssafy.aieng.domain.song.dto.response.SongResponseList;
import com.ssafy.aieng.domain.song.dto.response.SongStatusResponse;
import com.ssafy.aieng.domain.song.service.SongService;
import com.ssafy.aieng.domain.voice.service.VoiceService;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/songs")
@RequiredArgsConstructor
public class SongController {

    private final SongService songService;

    // 동요 생성 요청(FastAPI로 요청만)
    @PostMapping("/sessions/{sessionId}/generate-song")
    public ResponseEntity<ApiResponse<Void>> generateSongRequest(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestHeader("X-Child-Id") Integer childId,
            @PathVariable Integer sessionId
    ) {
        songService.generateSong(user.getId(), childId, sessionId);
        return ApiResponse.success(HttpStatus.OK);
    }


    // 동요 (Redis -> RDB 저장)
    @GetMapping("/sessions/{sessionId}/save-song")
    public ResponseEntity<ApiResponse<SongGenerateResponseDto>> getGeneratedSongFromRedis(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestHeader("X-Child-Id") Integer childId,
            @PathVariable Integer sessionId

    ) {
        SongGenerateResponseDto response = songService.getGeneratedSong(user.getId(), childId, sessionId);
        return ApiResponse.success(response);
    }

    // 동요 목록 조회
    @GetMapping
    public ResponseEntity<ApiResponse<SongResponseList>> getSongsByChild(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestHeader("X-Child-Id") Integer childId
    ) {
        SongResponseList response = songService.getSongsByChild(user.getId(), childId);
        return ApiResponse.success(response);
    }

    // 동요 상세 조회
    @GetMapping("/{songId}")
    public ResponseEntity<ApiResponse<SongDetailResponseDto>> getSongDetail(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestHeader("X-Child-Id") Integer childId,
            @PathVariable Integer songId
    ) {
        SongDetailResponseDto response = songService.getSongDetail(user.getId(), childId, songId);
        return ApiResponse.success(response);
    }

    // 동요 삭제 (소프트 딜리트)
    @DeleteMapping("/{songId}")
    public ResponseEntity<ApiResponse<Void>> deleteSong(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestHeader("X-Child-Id") Integer childId,
            @PathVariable Integer songId
    ) {
        songService.deleteSong(user.getId(), childId, songId);
        return ApiResponse.success(null);
    }

    // 동요 생성 상태
    @GetMapping("/sessions/{sessionId}/status")
    public ResponseEntity<ApiResponse<SongStatusResponse>> getSongStatus(
            @PathVariable Integer sessionId,
            @AuthenticationPrincipal UserPrincipal user,
            @RequestHeader("X-Child-Id") Integer childId
    ) {
        SongStatusResponse status = songService.getSongStatus(user.getId(), childId, sessionId);
        return ApiResponse.success(status);
    }

    // 좋아요 등록, 취소
    @PostMapping("/{songId}/like-toggle")
    public ResponseEntity<ApiResponse<Boolean>> toggleLikeSong(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestHeader("X-Child-Id") Integer childId,
            @PathVariable Integer songId
    ) {
        boolean liked = songService.toggleLikeSong(user.getId(), childId, songId);
        return ApiResponse.success(liked); // true: 찜됨, false: 찜 취소됨
    }

    // 해당 동요 찜여부 확인
    @GetMapping("/{songId}/like")
    public ResponseEntity<ApiResponse<Boolean>> isSongLiked(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestHeader("X-Child-Id") Integer childId,
            @PathVariable Integer songId
    ) {
        boolean liked = songService.isSongLiked(user.getId(), childId, songId);
        return ApiResponse.success(liked);
    }

    // 찜한 동요 목록 확인
    @GetMapping("/likes")
    public ResponseEntity<ApiResponse<SongResponseList>> getLikedSongs(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestHeader("X-Child-Id") Integer childId
    ) {
        SongResponseList response = songService.getLikedSongs(user.getId(), childId);
        return ApiResponse.success(response);
    }
}