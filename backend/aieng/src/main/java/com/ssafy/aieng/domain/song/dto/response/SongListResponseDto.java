package com.ssafy.aieng.domain.song.dto.response;

import com.ssafy.aieng.domain.song.entity.Song;
import com.ssafy.aieng.domain.song.entity.SongStatus;
import com.ssafy.aieng.domain.book.entity.Storybook;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SongListResponseDto {
    private Integer songId;
    private String coverUrl;
    private Integer voiceId;
    private Integer moodId;
    private String songUrl;
    private String title;
    private String lyric;
    private String description;
    private SongStatus status;
    private LocalDateTime createdAt;

    public static SongListResponseDto from(Song song, Storybook storybook) {
        return SongListResponseDto.builder()
                .songId(song.getId())
                .coverUrl(storybook.getCoverUrl())
                .voiceId(song.getVoice().getId())
                .moodId(song.getMood().getId())
                .songUrl(song.getSongUrl())
                .title(song.getTitle())
                .lyric(song.getLyric())
                .description(song.getDescription())
                .status(song.getStatus())
                .createdAt(song.getCreatedAt())
                .build();
    }
} 