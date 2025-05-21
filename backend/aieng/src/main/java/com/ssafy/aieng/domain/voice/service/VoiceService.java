package com.ssafy.aieng.domain.voice.service;


import com.ssafy.aieng.domain.child.entity.Child;
import com.ssafy.aieng.domain.child.repository.ChildRepository;
import com.ssafy.aieng.domain.mood.entity.Mood;
import com.ssafy.aieng.domain.mood.repository.MoodRepository;
import com.ssafy.aieng.domain.voice.dto.request.PronounceTestRequest;
import com.ssafy.aieng.domain.voice.dto.request.VoiceSettingRequest;
import com.ssafy.aieng.domain.voice.dto.request.VoiceUploadRequest;
import com.ssafy.aieng.domain.voice.dto.response.PronounceTestResponse;
import com.ssafy.aieng.domain.voice.dto.response.VoiceResponse;
import com.ssafy.aieng.domain.voice.entity.Voice;
import com.ssafy.aieng.domain.voice.repository.VoiceRepository;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import org.springframework.beans.factory.annotation.Value;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriUtils;
import java.io.IOException;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;


@Service
@RequiredArgsConstructor
public class VoiceService {


    private final VoiceRepository voiceRepository;
    private final ChildRepository childRepository;
    private final MoodRepository moodRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    // 음성파일 URL 등록
    @Transactional
    public void saveVoiceUrl(Integer userId, Integer childId, VoiceUploadRequest dto) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));
        if (!child.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }
        String audioUrl = dto.getAudioUrl();

        Voice voice = Voice.builder()
                .childId(childId)
                .audioUrl(audioUrl)
                .build();
        voiceRepository.save(voice);
    }

    // 아이가 업로드한 목소리 + default 목소리 조회
    public List<VoiceResponse> getDefaultAndChildVoices(Integer userId, Integer childId) {
        // 항상 default 목소리 포함
        List<VoiceResponse> defaultVoices = voiceRepository.findDefaultVoices().stream()
                .map(VoiceResponse::from)
                .toList();

        // childId 방어 (안정성 차원에서 한 번 더 체크)
        if (childId == null) {
            return defaultVoices;
        }

        // 아이 유효성 및 권한 검사
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));
        if (!child.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // 아이의 목소리 가져오기
        List<VoiceResponse> childVoices = voiceRepository.findByChildId(childId).stream()
                .map(VoiceResponse::from)
                .toList();

        // default + 아이 목소리 반환
        return Stream.concat(defaultVoices.stream(), childVoices.stream())
                .toList();
    }



    // 목소리 상세 조회
    @Transactional(readOnly = true)
    public VoiceResponse getVoiceDetail(Integer userId, Integer childId, Integer voiceId) {
        Voice voice = voiceRepository.findById(voiceId)
                .orElseThrow(() -> new CustomException(ErrorCode.VOICE_FILE_NOT_FOUND));

        // 자녀가 등록한 목소리인 경우에만 소유자 검증
        if (voice.getChildId() != null) {
            if (!voice.getChildId().equals(childId)) {
                throw new CustomException(ErrorCode.INVALID_CHILD_ACCESS);
            }

            // userId 일치 검증
            Child child = childRepository.findById(childId)
                    .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));
            if (!child.getUser().getId().equals(userId)) {
                throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
            }
        }
        return VoiceResponse.from(voice);
    }

    // 목소리 삭제
    @Transactional
    public void deleteVoice(Integer userId, Integer childId, Integer voiceId) {
        Voice voice = voiceRepository.findById(voiceId)
                .orElseThrow(() -> new CustomException(ErrorCode.VOICE_FILE_NOT_FOUND));


        // 디폴트 목소리는 삭제 불가 (childId == null)
        if (voice.getChildId() == null) {
            throw new CustomException(ErrorCode.CANNOT_DELETE_DEFAULT_VOICE);
        }

        // 자녀 소유자 검증
        if (!voice.getChildId().equals(childId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));
        if (!child.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        voiceRepository.delete(voice);
    }

    // 목소리 세팅
    public void updateVoiceSettings(Integer userId, Integer childId, VoiceSettingRequest request) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));
        if (!child.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // Voice 및 Mood 엔티티 조회 및 설정
        if (request.getTtsVoiceId() != null) {
            Voice ttsVoice = voiceRepository.findById(request.getTtsVoiceId())
                    .orElseThrow(() -> new CustomException(ErrorCode.VOICE_NOT_FOUND));
            child.setTtsVoice(ttsVoice);
        }

        if (request.getSongVoiceId() != null) {
            Voice songVoice = voiceRepository.findById(request.getSongVoiceId())
                    .orElseThrow(() -> new CustomException(ErrorCode.VOICE_NOT_FOUND));
            child.setSongVoice(songVoice);
        }

        if (request.getMoodId() != null) {
            Mood mood = moodRepository.findById(request.getMoodId())
                    .orElseThrow(() -> new CustomException(ErrorCode.MOOD_NOT_FOUND));
            child.setMood(mood);
        }

        childRepository.save(child);
    }


    // 보이스 테이블 기본키에 따른 목소리 조회
    public VoiceResponse getVoiceById(Integer id) {
        Voice voice = voiceRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.VOICE_NOT_FOUND));
        return VoiceResponse.from(voice);
    }

     // 자녀 ID에 해당하는 커스텀(사용자 업로드) 목소리만 조회
     public List<VoiceResponse> getDefaultVoices() {
         return voiceRepository.findAllDefaultVoices().stream()
                 .map(VoiceResponse::from)
                 .toList();
     }

    public List<VoiceResponse> getCustomVoicesByChildId(Integer userId, Integer childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));
        if (!child.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }
        return voiceRepository.findAllCustomVoicesForChild(childId).stream()
                .map(VoiceResponse::from)
                .toList();
    }

    @Value("${external.fastapi.base-url}")
    private String fastApiBaseUrl = "http://175.121.93.70:51528";

    // 발음 테스트
    public PronounceTestResponse getPronounceTest(
            Integer childId, Integer userId, String expectedText, MultipartFile audioFile
    ) throws IOException {
        // 1. 자녀 존재 및 소유자 검증
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));
        if (!child.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // 2. 쿼리 파라미터 추가
        String url = fastApiBaseUrl + "/pronunciation/evaluate?expected_text=" +
                UriUtils.encodeQueryParam(expectedText, "UTF-8");

        // 3. Multipart/form-data body 생성
        File tempFile = File.createTempFile("audio-", ".ogg");
        try {
            audioFile.transferTo(tempFile);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("audio_file", new FileSystemResource(tempFile));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> httpEntity = new HttpEntity<>(body, headers);

            // 4. FastAPI로 POST 요청
            ResponseEntity<PronounceTestResponse> response = restTemplate.postForEntity(
                    url,
                    httpEntity,
                    PronounceTestResponse.class
            );

            if (response.getBody() == null) {
                throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
            }
            return response.getBody();

        } finally {
            // 5. 임시 파일 삭제 (에러 여부 관계 없이 삭제)
            tempFile.delete();
        }
    }


} 