package com.ssafy.aieng.domain.song.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SongStatusDetail {

    private Integer songId;
    private Integer sessionId;
    private boolean redisKeyExists;
    private boolean rdbSaved;
    private String songUrl;
    private String lyricsKo;
    private String lyricsEn;
}
