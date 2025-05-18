package com.ssafy.aieng.domain.song.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.aieng.domain.mood.entity.Mood;
import com.ssafy.aieng.domain.mood.repository.MoodRepository;
import com.ssafy.aieng.domain.song.dto.request.SongGenerateRequestDto;
import com.ssafy.aieng.domain.song.dto.response.SongGenerateResponseDto;
import com.ssafy.aieng.domain.song.dto.response.SongListResponseDto;
import com.ssafy.aieng.domain.song.entity.Song;
import com.ssafy.aieng.domain.song.repository.SongRepository;
import com.ssafy.aieng.domain.voice.entity.Voice;
import com.ssafy.aieng.domain.voice.repository.VoiceRepository;
import com.ssafy.aieng.domain.book.entity.Storybook;
import com.ssafy.aieng.domain.book.repository.StorybookRepository;
import com.ssafy.aieng.domain.child.entity.Child;
import com.ssafy.aieng.domain.child.repository.ChildRepository;
import com.ssafy.aieng.domain.session.entity.Session;
import com.ssafy.aieng.domain.session.repository.SessionRepository;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpHeaders;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.ssafy.aieng.domain.song.dto.response.SongDetailResponseDto;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class SongService {

    private static final String FASTAPI_URL = "https://www.aieng.co.kr/fastapi/songs/";
    private final ObjectMapper objectMapper;

    private final SongRepository songRepository;
    private final VoiceRepository voiceRepository;
    private final MoodRepository moodRepository;
    private final ChildRepository childRepository;
    private final SessionRepository sessionRepository;
    private final StorybookRepository storybookRepository;


    // 동요 생성
    @Transactional
    public SongGenerateResponseDto generateSong(Integer userId, Integer childId, Integer sessionId, SongGenerateRequestDto requestDto) {
        // 1. 유저와 자녀 검증
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));
        if (!child.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // 2. 세션 검증
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.SESSION_NOT_FOUND));
        if (!session.getChild().getId().equals(childId)) {
            throw new CustomException(ErrorCode.INVALID_SESSION_ACCESS);
        }

        // 3. Voice, Mood 조회
        Voice voice = voiceRepository.findById(requestDto.getVoice())
                .orElseThrow(() -> new CustomException(ErrorCode.VOICE_NOT_FOUND));
        Mood mood = moodRepository.findById(requestDto.getMood())
                .orElseThrow(() -> new CustomException(ErrorCode.MOOD_NOT_FOUND));

        // 4. FastAPI 요청 준비
        Map<String, Object> fastApiRequest = Map.of(
                "userId", userId,
                "sessionId", sessionId,
                "moodName", mood.getName(),
                "voiceName", voice.getName()
        );

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(fastApiRequest, headers);

            ResponseEntity<String> fastApiResponse = new RestTemplate().postForEntity(
                    FASTAPI_URL,
                    entity,
                    String.class
            );

            if (fastApiResponse.getStatusCode().isError()) {
                throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
            }

            String responseBody = fastApiResponse.getBody();
            if (responseBody == null || responseBody.isBlank()) {
                throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
            }

            JsonNode json = objectMapper.readTree(responseBody);

            // ✅ FastAPI 응답 필드 이름에 맞게 수정
            Song song = Song.builder()
                    .storybookId(requestDto.getStorybookId())
                    .voice(voice)
                    .mood(mood)
                    .title("AI Generated Song") // 고정값 또는 추후 FastAPI 응답 필드 추가 시 변경
                    .lyric(json.get("lyricsEn").asText())
                    .description(json.get("lyricsKo").asText())
                    .songUrl(json.get("songUrl").asText())
                    .build();

            songRepository.save(song);
            session.markSongDoneAndFinish();

            return SongGenerateResponseDto.of(song);

        } catch (Exception e) {
            log.error("❌ FastAPI 동요 생성 실패", e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }




    @Transactional(readOnly = true)
    public List<SongListResponseDto> getSongList() {
        List<Song> songs = songRepository.findAllByDeletedFalse();
        return songs.stream()
                .map(song -> {
                    Storybook storybook = storybookRepository.findById(song.getStorybookId())
                            .orElseThrow(() -> new CustomException(ErrorCode.STORYBOOK_NOT_FOUND));
                    return SongListResponseDto.from(song, storybook);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SongDetailResponseDto getSongDetail(Integer songId) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new CustomException(ErrorCode.SONG_NOT_FOUND));

        Storybook storybook = storybookRepository.findById(song.getStorybookId())
                .orElseThrow(() -> new CustomException(ErrorCode.STORYBOOK_NOT_FOUND));

        return SongDetailResponseDto.from(song, storybook);
    }

    @Transactional
    public void deleteSong(Integer songId) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new CustomException(ErrorCode.SONG_NOT_FOUND));

        if (song.isAlreadyDeleted()) {
            throw new CustomException(ErrorCode.SONG_ALREADY_DELETED);
        }

        song.softDelete();
    }
} 