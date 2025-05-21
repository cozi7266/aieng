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

    public static VoiceResponse from(Voice voice) {

        return new VoiceResponse(
                voice.getId(),
                voice.getChildId(),
                voice.getName(),
                voice.getDescription(),
                voice.getAudioUrl()
        );
    }
} 