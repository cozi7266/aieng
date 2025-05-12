package com.ssafy.aieng.domain.mood.dto;

import com.ssafy.aieng.domain.mood.entity.Mood;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MoodResponseDto {
    private Integer id;
    private String name;

    public static MoodResponseDto from(Mood mood) {
        return MoodResponseDto.builder()
                .id(mood.getId())
                .name(mood.getName())
                .build();
    }
} 