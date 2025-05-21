package com.ssafy.aieng.domain.voice.service;


import com.ssafy.aieng.domain.child.entity.Child;
import com.ssafy.aieng.domain.child.repository.ChildRepository;
import com.ssafy.aieng.domain.mood.entity.Mood;
import com.ssafy.aieng.domain.mood.repository.MoodRepository;
import com.ssafy.aieng.domain.voice.dto.request.VoiceSettingRequest;
import com.ssafy.aieng.domain.voice.dto.response.VoiceResponse;
import com.ssafy.aieng.domain.voice.entity.Voice;
import com.ssafy.aieng.domain.voice.repository.VoiceRepository;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;


@Service
@RequiredArgsConstructor
public class VoiceService {

    private final VoiceRepository voiceRepository;
    private final ChildRepository childRepository;
    private final MoodRepository moodRepository;
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("mp3", "wav");
    private static final long MIN_FILE_LENGTH_SECONDS = 30; // 30초
    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB


//    // 목소리 파일 S3에 저장 (백엔드 방식)
//    @Transactional
//    public VoiceResponse createVoice(Integer userId, Integer childId, VoiceCreateRequest request) {
//        // 자녀 검증
//        Child child = childRepository.findById(childId)
//                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));
//        if (!child.getUser().getId().equals(userId)) {
//            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
//        }
//
//        MultipartFile audioFile = request.getAudioFile();
//        validateAudioFile(audioFile);
//
//        String audioUrl = uploadAudioFile(audioFile);
//
//        Voice voice = Voice.builder()
//                .childId(childId)
//                .name(request.getName())
//                .description(request.getDescription())
//                .audioUrl(audioUrl)
//                .build();
//
//        Voice savedVoice = voiceRepository.save(voice);
//        return VoiceResponse.from(savedVoice);
//    }


//    private void validateAudioFile(MultipartFile file) {
//        if (file == null || file.isEmpty()) {
//            throw new IllegalArgumentException("음성 파일이 없습니다.");
//        }
//
//        // 파일 크기 검사
//        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
//            throw new IllegalArgumentException("파일 크기가 10MB를 초과할 수 없습니다.");
//        }
//
//        // 파일 확장자 검사
//        String originalFilename = file.getOriginalFilename();
//        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
//        if (!ALLOWED_EXTENSIONS.contains(extension)) {
//            throw new IllegalArgumentException("지원하지 않는 파일 형식입니다. (.mp3 또는 .wav 파일만 가능)");
//        }
//
//        // TODO: 파일 길이 검사 (30초 이상) - 실제 구현 시 오디오 파일 분석 라이브러리 사용 필요
//    }


//    /**
//     * (임시) 음성 파일을 S3에 업로드한 것처럼 파일 URL을 반환하는 메서드.
//     * 실제 S3 연동 전에, 로컬/테스트 환경에서 파일 업로드를 흉내냄.
//     *
//     * @param file 업로드할 파일
//     * @return 업로드된 파일의 임시 URL (실제 S3 URL 아님)
//     */
//    private String uploadAudioFile(MultipartFile file) {
//        try {
//            String extension = FilenameUtils.getExtension(file.getOriginalFilename());
//            String uuid = UUID.randomUUID().toString();
//            String fileName = "voices/" + uuid + "." + extension;
//
//            // ======================
//            // 실제 S3 업로드 코드로 교체!
//            // ======================
//            ObjectMetadata metadata = new ObjectMetadata();
//            metadata.setContentLength(file.getSize());
//            metadata.setContentType(file.getContentType());
//
//            // S3에 파일 업로드
//
//
//            // 실제 접근 가능한 S3 URL 반환
//            return "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + fileName;
//            // 또는
//
//
//        } catch (Exception e) {
//            throw new RuntimeException("파일 업로드에 실패했습니다.", e);
//        }
//    }


//    // 음성파일 URL 등록
//    @Transactional
//    public void saveVoiceUrl(Integer userId, Integer childId, VoiceUploadRequest dto) {
//        Child child = childRepository.findById(childId)
//                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));
//        if (!child.getUser().getId().equals(userId)) {
//            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
//        }
//        String audioUrl = dto.getAudioUrl();
//        // 필요시 name, description 필드 추가해서 저장
//        Voice voice = Voice.builder()
//                .childId(childId)
//                .audioUrl(audioUrl)
//                .build();
//        voiceRepository.save(voice);
//    }

    // 디폴트 목소리 목록 조회
    @Transactional(readOnly = true)
    public List<VoiceResponse> getDefaultVoices() {
        List<Voice> defaultVoices = voiceRepository.findAllByChildIdIsNullOrderByCreatedAtDesc();

        return defaultVoices.stream()
                .map(VoiceResponse::from)
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


    // 아이가 업로드한 목소리 + default 목소리 조회
    public List<VoiceResponse> getVoicesByChildId(Integer userId, Integer childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));
        if (!child.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        return voiceRepository.findByChildId(childId).stream()
                .map(VoiceResponse::from)
                .toList();
    }


} 