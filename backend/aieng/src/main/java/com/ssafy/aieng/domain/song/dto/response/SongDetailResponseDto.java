package com.ssafy.aieng.domain.song.dto.response;

import com.ssafy.aieng.domain.song.entity.Song;
import com.ssafy.aieng.domain.song.entity.SongStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SongDetailResponseDto {

    // 동요 정보
    private Integer id;
    private String title;
    private String lyric;
    private String description;
    private String songUrl;
    private SongStatus status;
    private LocalDateTime createdAt;

    // 연관 정보
    private Integer moodId;
    private String moodName;

    public static SongDetailResponseDto from(Song song) {
        return SongDetailResponseDto.builder()
                .id(song.getId())
                .title(song.getTitle())
                .lyric(song.getLyric())
                .description(song.getDescription())
                .songUrl(song.getSongUrl())
                .status(song.getStatus())
                .createdAt(song.getCreatedAt())
                .moodId(song.getMood().getId())
                .moodName(song.getMood().getName())
                .build();
    }
}
