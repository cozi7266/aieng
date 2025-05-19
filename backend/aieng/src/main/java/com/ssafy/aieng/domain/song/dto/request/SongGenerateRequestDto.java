package com.ssafy.aieng.domain.song.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SongGenerateRequestDto {

    private String inputVoice;    // male vocal, female vocal

    private Integer moodId;

    private Integer storybookId;
}
