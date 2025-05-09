package com.ssafy.aieng.domain.voice.dto.request;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class VoiceCreateRequest {
    private Integer childId;
    private String name;
    private String description;
    private MultipartFile audioFile;  // 음성 파일
} 