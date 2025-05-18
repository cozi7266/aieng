package com.ssafy.aieng.domain.song.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.ssafy.aieng.domain.book.entity.LearningStorybook;
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
    public void generateSong(Integer userId, Integer childId, Integer sessionId, Integer storybookId, SongGenerateRequestDto requestDto) {
        // 1. 유저와 자녀 검증
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));
        if (!child.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // 2. Storybook 검증
        Storybook storybook = storybookRepository.findById(storybookId)
                .orElseThrow(() -> new CustomException(ErrorCode.STORYBOOK_NOT_FOUND));

        if (!storybook.getChild().getId().equals(childId)) {
            throw new CustomException(ErrorCode.INVALID_STORYBOOK_ACCESS);
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

        // 4. 세션 조회 (sessionId와 storybookId로 세션 조회)
        log.info("📌 세션 조회 시작: childId={}, storybookId={}", childId, storybookId);
        Session session = sessionRepository.findFirstByChildIdAndStorybookIdAndFinishedAtIsNotNull(childId, storybookId)
                .orElseThrow(() -> new CustomException(ErrorCode.SESSION_NOT_FOUND));
        log.info("✅ 세션 조회 완료: sessionId={}", session.getId());

        // 세션의 학습 항목 중 storybookId가 일치하는지 확인 (LearningStorybook을 통해 Storybook 확인)
        boolean isValidStorybook = session.getLearnings().stream()
                .flatMap(learning -> learning.getLearningStorybooks().stream()) // Learning -> LearningStorybook -> Storybook
                .anyMatch(learningStorybook -> learningStorybook.getStorybook().getId().equals(storybookId));

        if (!isValidStorybook) {
            throw new CustomException(ErrorCode.INVALID_SESSION_ACCESS);  // 일치하는 storybookId가 없으면 예외 처리
        }

        // 5. FastAPI 요청 구성 및 전송 (결과는 Redis에 저장됨)
        Map<String, Object> fastApiRequest = Map.of(
                "userId", userId,
                "sessionId", session.getId(),  // sessionId 사용
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

            // FastAPI 요청 전송
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






    // 동요 저장 (Redis -> RDB)
    @Transactional
    public SongGenerateResponseDto saveSongFromRedis(Integer userId, Integer childId, Integer sessionId, Integer storybookId) {
        // 1️⃣ 자녀 소유자 검증
        log.info("📌 자녀 검증 시작: childId={}", childId);
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));
        if (!child.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }
        log.info("✅ 자녀 검증 완료: childId={}", childId);

        // 2️⃣ 세션 조회 (sessionId와 storybookId를 사용하여 세션을 조회)
        log.info("📌 세션 조회 시작: childId={}, storybookId={}", childId, storybookId);
        Session session = sessionRepository.findFirstByChildIdAndStorybookIdAndFinishedAtIsNotNull(childId, storybookId)
                .orElseThrow(() -> new CustomException(ErrorCode.SESSION_NOT_FOUND));
        log.info("✅ 세션 조회 완료: sessionId={}", session.getId());

        // 3️⃣ Redis polling (최대 10번 시도, 0.5초 간격)
        log.info("📌 Redis에서 동요 정보 조회 시작: redisKey={}", RedisKeyUtil.getGeneratedSongKey(userId, sessionId));
        String redisKey = RedisKeyUtil.getGeneratedSongKey(userId, sessionId);
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
            log.error("❌ Redis에서 동요 정보를 찾을 수 없습니다. redisKey={}", redisKey);
            throw new CustomException(ErrorCode.RESOURCE_NOT_FOUND);
        }
        log.info("✅ Redis에서 동요 정보 조회 완료");

        try {
            // 4️⃣ JSON 파싱
            objectMapper.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
            Map<String, String> data = objectMapper.readValue(json, new TypeReference<>() {});
            log.info("📌 동요 정보 파싱 완료: songUrl={}, mood={}, voice={}", data.get("song_url"), data.get("mood"), data.get("voice"));

            String songUrl = data.get("song_url");
            String lyricsEn = data.get("lyrics_en");
            String lyricsKo = data.get("lyrics_ko");
            String moodName = data.get("mood");
            String voiceName = data.get("voice");

            if (songUrl == null || lyricsEn == null || lyricsKo == null) {
                log.error("❌ 동요 정보가 불완전합니다. songUrl={}, lyricsEn={}, lyricsKo={}", songUrl, lyricsEn, lyricsKo);
                throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
            }

            // 5️⃣ Voice, Mood, Storybook 조회
            log.info("📌 Voice 조회 시작: voiceName={}", voiceName);
            Voice voice = voiceRepository.findByName(voiceName)
                    .orElseThrow(() -> new CustomException(ErrorCode.VOICE_NOT_FOUND));
            log.info("✅ Voice 조회 완료: voiceId={}", voice.getId());

            log.info("📌 Mood 조회 시작: moodName={}", moodName);
            Mood mood = moodRepository.findByName(moodName)
                    .orElseThrow(() -> new CustomException(ErrorCode.MOOD_NOT_FOUND));
            log.info("✅ Mood 조회 완료: moodId={}", mood.getId());

            log.info("📌 Storybook 조회 시작: storybookId={}", storybookId);
            Storybook storybook = storybookRepository.findById(storybookId)
                    .orElseThrow(() -> new CustomException(ErrorCode.STORYBOOK_NOT_FOUND));
            log.info("✅ Storybook 조회 완료: storybookId={}", storybook.getId());

            // 6️⃣ Song 저장
            log.info("📌 Song 저장 시작");
            Song song = Song.builder()
                    .voice(voice)
                    .mood(mood)
                    .storybook(storybook)
                    .title("AI Generated Song")
                    .lyric(lyricsEn)
                    .description(lyricsKo)
                    .songUrl(songUrl)
                    .build();

            songRepository.save(song);
            session.markSongDoneAndFinish();
            log.info("✅ 동요 저장 완료: songId={}, sessionId={}", song.getId(), session.getId());

            return SongGenerateResponseDto.of(song);

        } catch (Exception e) {
            log.error("❌ 동요 저장 실패", e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }






}