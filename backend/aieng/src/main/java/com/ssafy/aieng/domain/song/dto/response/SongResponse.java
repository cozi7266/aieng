package com.ssafy.aieng.domain.song.dto.response;

import com.ssafy.aieng.domain.song.entity.Song;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SongResponse {

    private Integer songId;
    private String title;
    private LocalDateTime createdAt;

    public static SongResponse of(Song song) {
        return SongResponse.builder()
                .songId(song.getId())
                .title(song.getTitle())
                .createdAt(song.getCreatedAt())
                .build();
    }
}
