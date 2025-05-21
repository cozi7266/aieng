package com.ssafy.aieng.domain.song.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SongStatusResponse {

    private String status;
    private SongStatusDetail details;

    public static SongStatusResponse of(String status, SongStatusDetail details) {
        return new SongStatusResponse(status, details);
    }
}