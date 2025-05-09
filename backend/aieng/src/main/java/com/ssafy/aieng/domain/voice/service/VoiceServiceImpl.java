package com.ssafy.aieng.domain.voice.service;

import com.ssafy.aieng.domain.voice.dto.request.VoiceCreateRequest;
import com.ssafy.aieng.domain.voice.dto.response.VoiceResponse;
import com.ssafy.aieng.domain.voice.entity.Voice;
import com.ssafy.aieng.domain.voice.repository.VoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoiceServiceImpl implements VoiceService {

    private final VoiceRepository voiceRepository;
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("mp3", "wav");
    private static final long MIN_FILE_LENGTH_SECONDS = 30; // 30초
    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

    @Override
    @Transactional
    public VoiceResponse createVoice(VoiceCreateRequest request) {
        MultipartFile audioFile = request.getAudioFile();
        validateAudioFile(audioFile);

        // 파일 업로드 및 URL 생성
        String audioUrl = uploadAudioFile(audioFile);

        Voice voice = Voice.builder()
                .childId(request.getChildId())
                .name(request.getName())
                .description(request.getDescription())
                .audioUrl(audioUrl)
                .build();

        Voice savedVoice = voiceRepository.save(voice);
        return VoiceResponse.from(savedVoice);
    }

    private void validateAudioFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("음성 파일이 없습니다.");
        }

        // 파일 크기 검사
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("파일 크기가 10MB를 초과할 수 없습니다.");
        }

        // 파일 확장자 검사
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("지원하지 않는 파일 형식입니다. (.mp3 또는 .wav 파일만 가능)");
        }

        // TODO: 파일 길이 검사 (30초 이상) - 실제 구현 시 오디오 파일 분석 라이브러리 사용 필요
    }

    private String uploadAudioFile(MultipartFile file) {
        try {
            // TODO: AWS S3 업로드 로직 구현
            // 1. S3 클라이언트 설정
            // 2. 파일 업로드
            // 3. 업로드된 파일의 URL 반환
            
            // 임시로 파일명으로 URL 생성
            return "https://s3.amazonaws.com/aieng-bucket/voices/" + file.getOriginalFilename();
        } catch (Exception e) {
            throw new RuntimeException("파일 업로드에 실패했습니다.", e);
        }
    }
} 