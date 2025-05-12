package com.ssafy.aieng.domain.song.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SongGenerateRequestDto {
    private Integer storybookId;
    private Integer voiceId;
    private Integer moodId;
} 