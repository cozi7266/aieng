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
public class SongGenerateResponseDto {
    private Integer songId;
    private Integer moodId;
    private String songUrl;
    private String title;
    private String lyric;
    private String description;
    private LocalDateTime createdAt;

    public static SongGenerateResponseDto of(Song song) {
        return SongGenerateResponseDto.builder()
                .songId(song.getId())
                .moodId(song.getMood().getId())
                .songUrl(song.getSongUrl())
                .title(song.getTitle())
                .lyric(song.getLyric())
                .description(song.getDescription())
                .createdAt(song.getCreatedAt())
                .build();
    }
}
