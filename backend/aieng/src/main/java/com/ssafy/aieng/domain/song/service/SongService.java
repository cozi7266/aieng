package com.ssafy.aieng.domain.song.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.aieng.domain.mood.entity.Mood;
import com.ssafy.aieng.domain.mood.repository.MoodRepository;
import com.ssafy.aieng.domain.song.dto.request.SongGenerateRequestDto;
import com.ssafy.aieng.domain.song.dto.response.SongGenerateResponseDto;
import com.ssafy.aieng.domain.song.dto.response.SongListResponseDto;
import com.ssafy.aieng.domain.song.entity.Song;
import com.ssafy.aieng.domain.song.entity.SongStatus;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.HashMap;
import java.util.stream.Collectors;

import com.ssafy.aieng.domain.song.dto.response.SongDetailResponseDto;

@Slf4j
@Service
@RequiredArgsConstructor
public class SongService {

    private static final String FASTAPI_URL = "http://localhost:8000";
    private final ObjectMapper objectMapper;

    private final SongRepository songRepository;
    private final VoiceRepository voiceRepository;
    private final MoodRepository moodRepository;
    private final ChildRepository childRepository;
    private final SessionRepository sessionRepository;
    @Autowired
    private final StorybookRepository storybookRepository;

    @Transactional
    public SongGenerateResponseDto generateSong(SongGenerateRequestDto requestDto) {
        try {
            // 1. Voice와 Mood 정보 조회
            Voice voice = voiceRepository.findById(requestDto.getVoiceId())
                    .orElseThrow(() -> new CustomException(ErrorCode.VOICE_NOT_FOUND));
            
            Mood mood = moodRepository.findById(requestDto.getMoodId())
                    .orElseThrow(() -> new CustomException(ErrorCode.MOOD_NOT_FOUND));

            // 현재 진행 중인 세션 조회 (Child와 User 정보도 함께 조회)
            Session session = sessionRepository.findTopByChildIdOrderByCreatedAtDesc(voice.getChildId())
                    .orElseThrow(() -> new CustomException(ErrorCode.SESSION_NOT_FOUND));

            Child child = session.getChild();  // Session에서 Child 정보를 직접 가져옴

            // 2. FastAPI 요청 형식으로 변환
            var fastApiRequest = new HashMap<String, String>();
            fastApiRequest.put("userId", child.getUser().getId().toString());
            fastApiRequest.put("sessionId", session.getId().toString());
            fastApiRequest.put("moodName", mood.getName());
            fastApiRequest.put("voiceName", voice.getName());

            // 3. FastAPI 서버로 요청 전송
            URL url = new URL(FASTAPI_URL + "/songs");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            String jsonInputString = objectMapper.writeValueAsString(fastApiRequest);
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonInputString.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            int responseCode = conn.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
            }

            StringBuilder response = new StringBuilder();
            try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                String responseLine;
                while ((responseLine = br.readLine()) != null) {
                    response.append(responseLine.trim());
                }
            }

            String responseBody = response.toString();
            if (responseBody.isEmpty()) {
                throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
            }

            // FastAPI 응답 파싱
            JsonNode responseJson = objectMapper.readTree(responseBody);
            String songUrl = responseJson.get("song_url").asText();
            String title = responseJson.get("title").asText();
            String lyric = responseJson.get("lyric").asText();
            String description = responseJson.get("description").asText();

            // 4. 노래 정보 저장
            Song song = Song.builder()
                    .storybookId(requestDto.getStorybookId())
                    .voice(voice)
                    .mood(mood)
                    .title(title)
                    .lyric(lyric)
                    .description(description)
                    .songUrl(songUrl)
                    .build();
            
            songRepository.save(song);

            // 세션 상태 업데이트
            session.markSongDoneAndFinish();

            // 5. 응답 생성
            return SongGenerateResponseDto.builder()
                    .songUrl(songUrl)
                    .message("Song generated successfully")
                    .status("SUCCESS")
                    .title(title)
                    .lyric(lyric)
                    .description(description)
                    .build();

        } catch (Exception e) {
            log.error("Error generating song: ", e);
            return SongGenerateResponseDto.builder()
                    .message("Failed to generate song: " + e.getMessage())
                    .status("FAILED")
                    .build();
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