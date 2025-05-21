package com.ssafy.aieng.domain.voice.dto.response;

import com.ssafy.aieng.domain.voice.entity.Voice;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class VoiceResponse {
    private Integer voiceId;
    private Integer childId;
    private String name;
    private String description;
    private String audioUrl;
    private boolean isDefault;

    public static VoiceResponse from(Voice voice) {
        return VoiceResponse.builder()
                .voiceId(voice.getId())
                .childId(voice.getChildId())
                .name(voice.getName())
                .description(voice.getDescription())
                .audioUrl(voice.getAudioUrl())
                .isDefault(voice.getChildId() == null)
                .build();
    }
} 