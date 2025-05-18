package com.ssafy.aieng.domain.song.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
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
import com.ssafy.aieng.global.common.util.RedisKeyUtil;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
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
    private final StringRedisTemplate stringRedisTemplate;


    // 동요 생성
    @Transactional
    public void generateSong(Integer userId, Integer childId, Integer sessionId, SongGenerateRequestDto requestDto) {
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

        if (voice.getName().isBlank() || mood.getName().isBlank()) {
            log.error("❌ Voice 또는 Mood 이름이 비어 있음 - voiceName={}, moodName={}", voice.getName(), mood.getName());
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        // 4. FastAPI 요청 구성 및 전송 (결과는 Redis에 저장됨)
        Map<String, Object> fastApiRequest = Map.of(
                "userId", userId,
                "sessionId", sessionId,
                "moodName", mood.getName(),
                "voiceName", voice.getName()
        );

        try {
            ObjectMapper mapper = new ObjectMapper();
            String jsonPayload = mapper.writeValueAsString(fastApiRequest);
            log.info("📤 FastAPI 전송 데이터: {}", jsonPayload);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(jsonPayload, headers);

            ResponseEntity<String> fastApiResponse = new RestTemplate().postForEntity(
                    FASTAPI_URL,
                    entity,
                    String.class
            );

            log.info("✅ FastAPI 응답 코드: {}", fastApiResponse.getStatusCodeValue());
            if (fastApiResponse.getStatusCode().isError()) {
                throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
            }

            log.info("🎵 동요 생성 요청 완료 (FastAPI가 Redis에 저장 예정)");

        } catch (Exception e) {
            log.error("❌ FastAPI 동요 생성 요청 실패", e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }


    @Transactional
    public SongGenerateResponseDto saveSongFromRedis(Integer userId, Integer childId, Integer sessionId) {
        // 1️⃣ 자녀 소유자 검증
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));
        if (!child.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // 2️⃣ 세션 조회
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.SESSION_NOT_FOUND));

        if (!session.getChild().getId().equals(childId)) {
            throw new CustomException(ErrorCode.INVALID_SESSION_ACCESS);
        }

        // 3️⃣ Redis polling (최대 10번 시도, 0.5초 간격)
        String redisKey = RedisKeyUtil.getGeneratedSongKey(userId, sessionId);  // ex: Song:user:{userId}:session:{sessionId}
        String json = null;
        int retry = 0;
        while (retry < 10) {
            json = stringRedisTemplate.opsForValue().get(redisKey);
            if (json != null) break;
            try {
                Thread.sleep(500);
            } catch (InterruptedException ignored) {}
            retry++;
        }

        if (json == null) {
            throw new CustomException(ErrorCode.RESOURCE_NOT_FOUND); // 결과 없음
        }

        try {
            objectMapper.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
            Map<String, String> data = objectMapper.readValue(json, new TypeReference<>() {});

            String songUrl = data.get("song_url");
            String lyricsEn = data.get("lyrics_en");
            String lyricsKo = data.get("lyrics_ko");
            String moodName = data.get("mood");
            String voiceName = data.get("voice");

            if (songUrl == null || lyricsEn == null || lyricsKo == null) {
                throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
            }

            // 4️⃣ Voice, Mood 조회
            Voice voice = voiceRepository.findByName(voiceName)
                    .orElseThrow(() -> new CustomException(ErrorCode.VOICE_NOT_FOUND));
            Mood mood = moodRepository.findByName(moodName)
                    .orElseThrow(() -> new CustomException(ErrorCode.MOOD_NOT_FOUND));

            // 5️⃣ Song 저장
            Song song = Song.builder()
                    .voice(voice)
                    .mood(mood)
                    .title("AI Generated Song")
                    .lyric(lyricsEn)
                    .description(lyricsKo)
                    .songUrl(songUrl)
                    .build();

            songRepository.save(song);
            session.markSongDoneAndFinish();

            log.info("🎵 동요 저장 완료: sessionId={}, songUrl={}", sessionId, songUrl);

            return SongGenerateResponseDto.of(song);

        } catch (Exception e) {
            log.error("❌ Redis 동요 파싱 실패", e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }


}