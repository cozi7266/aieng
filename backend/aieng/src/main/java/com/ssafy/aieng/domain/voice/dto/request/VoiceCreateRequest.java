package com.ssafy.aieng.domain.voice.dto.request;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class VoiceCreateRequest {

    private String name;
    private String description;
    private MultipartFile audioFile; // (백엔드 방식일 때만)
    private String audioUrl;         // (프론트 방식 일때, S3 직접 업로드 방식일 때만)
} 