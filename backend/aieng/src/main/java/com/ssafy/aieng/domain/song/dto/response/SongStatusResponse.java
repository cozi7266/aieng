package com.ssafy.aieng.domain.song.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SongStatusResponse {
    private String status; // NONE, REQUESTED, IN_PROGRESS, READY, SAVED, FAILED
    private SongStatusDetail details;

    public static SongStatusResponse of(String status, SongStatusDetail details) {
        return new SongStatusResponse(status, details);
    }
}