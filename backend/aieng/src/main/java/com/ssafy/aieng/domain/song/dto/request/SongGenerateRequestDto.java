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

    @JsonProperty("voiceId")    // 요청에서 "voiceId"로 매핑
    private Integer voice;

    @JsonProperty("moodId")     // 요청에서 "moodId"로 매핑
    private Integer mood;

    @JsonProperty("storybookId")  // 요청 및 응답에서 "storybookId"로 매핑
    private Integer storybookId;
}
