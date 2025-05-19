package com.ssafy.aieng.domain.song.dto.response;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SongStatusResponse {

    private boolean storybookCreated;
    private String songStatus; // CREATED | GENERATING | FAILED
}