package com.ssafy.aieng.domain.voice.dto;

import com.ssafy.aieng.domain.voice.entity.Voice;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class VoiceResponseDto {
    private Integer id;
    private String name;
    private String description;

    public static VoiceResponseDto from(Voice voice) {
        return VoiceResponseDto.builder()
                .id(voice.getId())
                .name(voice.getName())
                .description(voice.getDescription())
                .build();
    }
} 