package com.ssafy.aieng.domain.voice.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VoiceUploadRequest {
    private String audioUrl;         // (프론트 방식 일때, S3 직접 업로드 방식일 때만)
}
