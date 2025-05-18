package com.ssafy.aieng.domain.song.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.aieng.domain.mood.entity.Mood;
import com.ssafy.aieng.domain.mood.repository.MoodRepository;
import com.ssafy.aieng.domain.song.dto.request.SongGenerateRequestDto;
import com.ssafy.aieng.domain.song.dto.response.SongGenerateResponseDto;
import com.ssafy.aieng.domain.song.dto.response.SongResponseList;
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
import org.springframework.web.client.HttpServerErrorException;
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
                // FastAPI 서버 오류가 발생한 경우
                String errorMessage = "FastAPI 응답 오류: " + fastApiResponse.getStatusCode().toString();
                log.error("❌ FastAPI 동요 생성 요청 실패: {}", errorMessage);
                throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
            }

            log.info("🎵 동요 생성 요청 완료 (FastAPI가 Redis에 저장 예정)");

        } catch (JsonProcessingException e) {
            log.error("❌ FastAPI 요청 데이터 변환 실패", e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        } catch (HttpServerErrorException e) {
            log.error("❌ FastAPI 서버 오류", e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
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

            // 필수 값이 하나라도 없으면 예외 처리
            if (lyricsEn == null || lyricsKo == null || songUrl == null || moodName == null || voiceName == null) {
                throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
            }

            // 6. Voice 객체 찾기
            Voice voice = voiceRepository.findByName(voiceName)
                    .orElseThrow(() -> new CustomException(ErrorCode.VOICE_NOT_FOUND));

            // 7. Mood 객체 찾기
            Mood mood = moodRepository.findByName(moodName)
                    .orElseThrow(() -> new CustomException(ErrorCode.MOOD_NOT_FOUND));

            // 8. Song 저장
            Song song = Song.builder()
                    .storybook(storybook) // Storybook 관련 정보 추가
                    .voice(voice)  // Voice 객체 할당
                    .mood(mood)  // Mood 객체 할당
                    .title("AI Generated Song")
                    .lyric(lyricsEn)
                    .description(lyricsKo)
                    .songUrl(songUrl)
                    .build();

            // 9. Song DB에 저장
            songRepository.save(song);
            // 세션 상태 업데이트
            session.markSongDoneAndFinish();

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





}