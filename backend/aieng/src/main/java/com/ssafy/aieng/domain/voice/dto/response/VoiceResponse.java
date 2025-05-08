package com.ssafy.aieng.domain.voice.dto.response;

import com.ssafy.aieng.domain.voice.entity.Voice;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class VoiceResponse {
    private Integer id;
    private String name;
    private String description;
    private String audioUrl;

    public static VoiceResponse from(Voice voice) {
        return VoiceResponse.builder()
                .id(voice.getId())
                .name(voice.getName())
                .description(voice.getDescription())
                .audioUrl(voice.getAudioUrl())
                .build();
    }
} 