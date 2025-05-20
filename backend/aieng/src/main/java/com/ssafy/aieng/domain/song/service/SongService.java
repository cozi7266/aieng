package com.ssafy.aieng.domain.song.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.aieng.domain.mood.entity.Mood;
import com.ssafy.aieng.domain.mood.repository.MoodRepository;
import com.ssafy.aieng.domain.session.dto.response.CreateSessionResponse;
import com.ssafy.aieng.domain.session.service.SessionService;
import com.ssafy.aieng.domain.song.dto.request.SongGenerateRequestDto;
import com.ssafy.aieng.domain.song.dto.response.*;
import com.ssafy.aieng.domain.song.entity.Song;
import com.ssafy.aieng.domain.song.entity.SongStatus;
import com.ssafy.aieng.domain.song.repository.SongRepository;
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
import com.ssafy.aieng.domain.song.dto.response.SongStatusResponse;

import java.util.List;
import java.util.Map;

import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class SongService {

    private static final String FASTAPI_URL = "https://www.aieng.co.kr/fastapi/songs/";


    private final SongRepository songRepository;
    private final MoodRepository moodRepository;
    private final ChildRepository childRepository;
    private final SessionRepository sessionRepository;
    private final StorybookRepository storybookRepository;
    private final StringRedisTemplate stringRedisTemplate;
    private final SessionService sessionService;


    // 동요 생성
    @Transactional
    public void generateSong(Integer userId, Integer childId, Integer sessionId, SongGenerateRequestDto requestDto) {
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

        // ✅ 2-1. 이미 해당 세션으로 동요가 생성된 경우 중복 방지
        if (songRepository.existsBySessionId(sessionId)) {
            throw new CustomException(ErrorCode.DUPLICATE_SONG);
        }

        // 3. Mood 조회
        Mood mood = moodRepository.findById(requestDto.getMoodId())
                .orElseThrow(() -> new CustomException(ErrorCode.MOOD_NOT_FOUND));

        // 4. Voice 유효성 체크
        String voiceName = requestDto.getInputVoice();
        if (voiceName == null || voiceName.isBlank()) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        // ✅ 5. 그림책 자동 생성 (DB에는 저장하지만 Redis 키에는 사용하지 않음)
        Storybook storybook = Storybook.builder()
                .child(child)
                .coverUrl("https://aieng.s3.ap-northeast-2.amazonaws.com/default_cover.png")
                .title("AI Generated Storybook")
                .description("동요 생성을 위한 자동 생성 그림책입니다.")
                .build();
        storybookRepository.save(storybook);

        // ✅ 6. 상태: REQUESTED
        stringRedisTemplate.opsForValue().set(
                RedisKeyUtil.getSongStatusKey(sessionId),
                SongStatus.REQUESTED.name()
        );

        // 7. FastAPI 요청 전송
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

                stringRedisTemplate.opsForValue().set(
                        RedisKeyUtil.getSongStatusKey(sessionId),
                        SongStatus.FAILED.name()
                );
                throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
            }

            log.info("🎵 동요 생성 요청 성공");

            // ✅ 상태: IN_PROGRESS
            stringRedisTemplate.opsForValue().set(
                    RedisKeyUtil.getSongStatusKey(sessionId),
                    SongStatus.IN_PROGRESS.name()
            );

        } catch (Exception e) {
            log.error("❌ 동요 생성 중 오류 발생", e);

            stringRedisTemplate.opsForValue().set(
                    RedisKeyUtil.getSongStatusKey(sessionId),
                    SongStatus.FAILED.name()
            );
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    // 동요 저장(Redis -> RDB)
    @Transactional
    public SongGenerateResponseDto getGeneratedSong(Integer userId, Integer childId, Integer sessionId) {
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

        // ✅ 2-1. 이미 해당 세션으로 동요가 저장된 경우 중복 방지
        if (songRepository.existsBySessionId(sessionId)) {
            throw new CustomException(ErrorCode.DUPLICATE_SONG);
        }

        // 3. Redis 결과 조회
        String redisKey = RedisKeyUtil.getGeneratedSongKey(userId, sessionId);
        String resultJson = stringRedisTemplate.opsForValue().get(redisKey);
        if (resultJson == null) {
            throw new CustomException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        try {
            JsonNode json = new ObjectMapper().readTree(resultJson);
            String lyricsEn = json.path("lyrics_en").asText(null);
            String lyricsKo = json.path("lyrics_ko").asText(null);
            String songUrl = json.path("song_url").asText(null);
            String moodName = json.path("mood").asText(null);
            String voiceName = json.path("voice").asText(null);
            String title = json.path("title").asText("AI Generated Song"); // ✅ 없으면 기본값

            if (lyricsEn == null || lyricsKo == null || songUrl == null || moodName == null || voiceName == null) {
                throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
            }

            // 4. Mood 엔티티 조회
            Mood mood = moodRepository.findByName(moodName)
                    .orElseThrow(() -> new CustomException(ErrorCode.MOOD_NOT_FOUND));

            // 5. Song 저장 (🎯 핵심: Session과 연결)
            Song song = Song.builder()
                    .mood(mood)
                    .title(title)
                    .lyric(lyricsEn)
                    .description(lyricsKo)
                    .songUrl(songUrl)
                    .session(session)
                    .build();

            songRepository.save(song);

            // 6. 상태 업데이트
            stringRedisTemplate.opsForValue().set(
                    RedisKeyUtil.getSongStatusKey(sessionId),
                    SongStatus.SAVED.name()
            );

            // 7. 세션 종료 및 새로운 세션 생성
            session.markSongDoneAndFinish();
            session.finish();

            CreateSessionResponse newSession = sessionService.forceCreateNewSession(
                    userId, childId, session.getTheme().getId()
            );

            return SongGenerateResponseDto.of(song, newSession.getSessionId());

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

        // 자녀의 세션을 기준으로 동요 목록 조회
        List<Song> songs = songRepository.findAllBySession_Child_IdOrderByCreatedAtDesc(childId);

        return SongResponseList.of(childId, songs);
    }


    @Transactional(readOnly = true)
    public SongDetailResponseDto getSongDetail(Integer userId, Integer childId, Integer songId) {
        // 자녀 조회 + 소유자 검증
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));
        if (!child.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // 동요 조회
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new CustomException(ErrorCode.SONG_NOT_FOUND));

        // 소유권 검증: 동요의 세션을 통해 자녀 확인
        if (!song.getSession().getChild().getId().equals(childId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // 응답 구성
        return SongDetailResponseDto.from(song);
    }

    // 동요 삭제(Soft Delete)
    @Transactional
    public void deleteSong(Integer userId, Integer childId, Integer songId) {
        // 1. 자녀 소유자 검증
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));
        if (!child.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // 2. 동요 조회
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new CustomException(ErrorCode.SONG_NOT_FOUND));

        // 🔥 더 이상 그림책과 연결되어 있지 않으므로 소유 검증 생략

        // 3. Soft Delete 처리
        song.softDelete();
    }


    // 동요 생성 상태 조회
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

        // ✅ 3. Redis 키: session 기준으로 조회
        String redisStatusKey = RedisKeyUtil.getSongStatusKey(sessionId);
        String redisGeneratedKey = RedisKeyUtil.getGeneratedSongKey(userId, sessionId);

        log.info("\uD83D\uDCCC Redis 상태 키: {}", redisStatusKey);
        log.info("\uD83D\uDCCC Redis 결과 키: {}", redisGeneratedKey);

        // ✅ 4. 상태 조회
        String statusStr = stringRedisTemplate.opsForValue().get(redisStatusKey);
        log.info("\uD83D\uDCE5 조회된 상태 문자열: {}", statusStr);
        SongStatus status = (statusStr != null) ? SongStatus.valueOf(statusStr) : SongStatus.NONE;

        // ✅ 5. 보정
        boolean redisKeyExists = Boolean.TRUE.equals(stringRedisTemplate.hasKey(redisGeneratedKey));
        if (status == SongStatus.IN_PROGRESS && redisKeyExists) {
            status = SongStatus.READY;
            stringRedisTemplate.opsForValue().set(redisStatusKey, SongStatus.READY.name());
            log.info("\u2705 상태 보정: IN_PROGRESS \u2192 READY (결과 키 존재)");
        }

        // ✅ 6. RDB 조회 - session 기준
        boolean rdbSaved = songRepository.existsBySessionId(sessionId);
        Song song = songRepository.findBySessionId(sessionId).orElse(null);
        log.info("\uD83D\uDDC3️ RDB 저장 여부: {}, songId: {}", rdbSaved, (song != null ? song.getId() : null));

        // ✅ 7. Redis 결과
        String songUrl = null;
        String lyricsKo = null;
        String lyricsEn = null;

        if ((status == SongStatus.READY || status == SongStatus.SAVED) && redisKeyExists) {
            try {
                String resultJson = stringRedisTemplate.opsForValue().get(redisGeneratedKey);
                log.info("\uD83C\uDFB6 Redis 결과 JSON: {}", resultJson);

                JsonNode jsonNode = new ObjectMapper().readTree(resultJson);
                songUrl = jsonNode.path("song_url").asText(null);
                lyricsKo = jsonNode.path("lyrics_ko").asText(null);
                lyricsEn = jsonNode.path("lyrics_en").asText(null);

            } catch (Exception e) {
                log.error("\u274C Redis 동요 결과 파싱 실패", e);
            }
        }

        // ✅ 8. DTO 반환 (storybookId는 단순 전달용)
        SongStatusDetail detail = new SongStatusDetail(
                (song != null ? song.getId() : null),
                sessionId,
                storybookId,
                redisKeyExists,
                rdbSaved,
                songUrl,
                lyricsKo,
                lyricsEn
        );

        return SongStatusResponse.of(status.name(), detail);
    }


}