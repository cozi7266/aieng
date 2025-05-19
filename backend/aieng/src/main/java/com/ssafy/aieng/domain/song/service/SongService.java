package com.ssafy.aieng.domain.song.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.aieng.domain.mood.entity.Mood;
import com.ssafy.aieng.domain.mood.repository.MoodRepository;
import com.ssafy.aieng.domain.song.dto.request.SongGenerateRequestDto;
import com.ssafy.aieng.domain.song.dto.response.SongGenerateResponseDto;
import com.ssafy.aieng.domain.song.dto.response.SongResponseList;
import com.ssafy.aieng.domain.song.dto.response.SongStatusResponse;
import com.ssafy.aieng.domain.song.entity.Song;
import com.ssafy.aieng.domain.song.repository.SongRepository;
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
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpHeaders;
import com.ssafy.aieng.domain.song.dto.response.SongStatusResponse;

import java.util.List;
import java.util.Map;

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
        // 1. 자녀 소유 검증
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

        // 3. Mood 조회
        Mood mood = moodRepository.findById(requestDto.getMoodId())
                .orElseThrow(() -> new CustomException(ErrorCode.MOOD_NOT_FOUND));

        // 4. 입력값 검증
        String voiceName = requestDto.getInputVoice();
        if (voiceName == null || voiceName.isBlank()) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        // 5. FastAPI 요청 데이터 구성
        Map<String, Object> fastApiRequest = Map.of(
                "userId", userId,
                "sessionId", sessionId,
                "moodName", mood.getName(),
                "voiceName", voiceName
        );

        try {
            ObjectMapper mapper = new ObjectMapper();
            String jsonPayload = mapper.writeValueAsString(fastApiRequest);
            log.info("📤 FastAPI 전송 데이터: {}", jsonPayload);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(jsonPayload, headers);

            ResponseEntity<String> fastApiResponse = new RestTemplate().postForEntity(
                    FASTAPI_URL, entity, String.class
            );

            if (fastApiResponse.getStatusCode().isError()) {
                log.error("❌ FastAPI 응답 실패: status={}, body={}",
                        fastApiResponse.getStatusCodeValue(), fastApiResponse.getBody());
                throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
            }

            log.info("🎵 동요 생성 요청 성공");


        } catch (Exception e) {
            log.error("❌ 동요 생성 중 오류 발생", e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }



    // 동요 저장(Redis -> RDB)
    @Transactional
    public SongGenerateResponseDto getGeneratedSong(Integer userId, Integer childId, Integer sessionId, Integer storybookId) {
        // 1. 자녀 검증
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

        // 3. Storybook 검증
        Storybook storybook = storybookRepository.findById(storybookId)
                .orElseThrow(() -> new CustomException(ErrorCode.STORYBOOK_NOT_FOUND));
        if (!storybook.getChild().getId().equals(childId)) {
            throw new CustomException(ErrorCode.INVALID_STORYBOOK_ACCESS);
        }

        // 4. Redis 결과 조회
        String redisKey = String.format("Song:user:%d:session:%d", userId, sessionId);
        String resultJson = stringRedisTemplate.opsForValue().get(redisKey);
        if (resultJson == null) {
            throw new CustomException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        try {
            // 5. JSON 파싱
            JsonNode json = new ObjectMapper().readTree(resultJson);
            String lyricsEn = json.path("lyrics_en").asText(null);
            String lyricsKo = json.path("lyrics_ko").asText(null);
            String songUrl = json.path("song_url").asText(null);
            String moodName = json.path("mood").asText(null);
            String voiceName = json.path("voice").asText(null);

            if (lyricsEn == null || lyricsKo == null || songUrl == null || moodName == null || voiceName == null) {
                throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
            }

            // 6. Mood 조회
            Mood mood = moodRepository.findByName(moodName)
                    .orElseThrow(() -> new CustomException(ErrorCode.MOOD_NOT_FOUND));

            // 7. Song 저장
            Song song = Song.builder()
                    .storybook(storybook)
                    .mood(mood)
                    .title("AI Generated Song")
                    .lyric(lyricsEn)
                    .description(lyricsKo)
                    .songUrl(songUrl)
                    .build();

            songRepository.save(song);
            session.markSongDoneAndFinish();
            session.finish();

            return SongGenerateResponseDto.of(song);

        } catch (JsonProcessingException e) {
            log.error("❌ Redis에서 동요 결과 파싱 실패", e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            log.error("❌ 동요 저장 실패", e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }


    // 동요 목록 조회
    @Transactional(readOnly = true)
    public SongResponseList getSongsByChild(Integer userId, Integer childId) {
        // 자녀 검증
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));
        if (!child.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // 동요 목록 조회
        List<Song> songs = songRepository.findAllByStorybookChildIdOrderByCreatedAtDesc(childId);

        return SongResponseList.of(childId, songs);
    }

    // 동요 상세 조회
    @Transactional(readOnly = true)
    public SongDetailResponseDto getSongDetail(Integer userId, Integer childId, Integer songId) {
        // 자녀 검증
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));
        if (!child.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // 동요 조회
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new CustomException(ErrorCode.SONG_NOT_FOUND));
        if (!song.getStorybook().getChild().getId().equals(childId)) {
            throw new CustomException(ErrorCode.INVALID_STORYBOOK_ACCESS);
        }

        // 그림책 정보 가져오기
        Storybook storybook = song.getStorybook();

        return SongDetailResponseDto.from(song, storybook);
    }

    // 동요 삭제(Soft Delete)
    @Transactional
    public void deleteSong(Integer userId, Integer childId, Integer songId) {
        // 자녀 검증
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));
        if (!child.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // 동요 조회
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new CustomException(ErrorCode.SONG_NOT_FOUND));

        // 자녀의 그림책 소유 여부 검증
        if (!song.getStorybook().getChild().getId().equals(childId)) {
            throw new CustomException(ErrorCode.INVALID_STORYBOOK_ACCESS);
        }

        // 소프트 딜리트 처리
        song.softDelete();
    }


    // 동요 생성 상태
    @Transactional(readOnly = true)
    public SongStatusResponse getSongStatus(Integer userId, Integer childId, Integer sessionId, Integer storybookId) {
        // 1. 자녀 검증
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

        // 3. 그림책 검증
        Storybook storybook = storybookRepository.findById(storybookId)
                .orElseThrow(() -> new CustomException(ErrorCode.STORYBOOK_NOT_FOUND));
        if (!storybook.getChild().getId().equals(childId)) {
            throw new CustomException(ErrorCode.INVALID_STORYBOOK_ACCESS);
        }

        // 4. 상태 판별
        boolean isCreated = songRepository.existsByStorybookId(storybookId);
        String redisKey = String.format("Song:user:%d:session:%d", userId, sessionId);
        boolean isGenerating = stringRedisTemplate.hasKey(redisKey);

        String status;
        if (isCreated) {
            status = "CREATED";
        } else if (isGenerating) {
            status = "GENERATING";
        } else {
            status = "FAILED";
        }

        return new SongStatusResponse(true, status);
    }







}