package com.ssafy.aieng.domain.song.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SongGenerateResponseDto {
    private Integer id;
    private Integer storybookId;
    private Integer voiceId;
    private Integer moodId;
    private String songUrl;
    private String message;
    private String status;
    private String title;
    private String lyric;
    private String description;
    private LocalDateTime createdAt;
} 