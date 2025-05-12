package com.ssafy.aieng.domain.song.dto.response;

import com.ssafy.aieng.domain.song.entity.Song;
import com.ssafy.aieng.domain.song.entity.SongStatus;
import com.ssafy.aieng.domain.book.entity.Storybook;
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
    
    // 연결된 정보
    private Integer voiceId;
    private String voiceName;
    private Integer moodId;
    private String moodName;
    
    // 그림책 정보
    private Integer storybookId;
    private String storybookTitle;
    private String storybookDescription;
    private String coverUrl;

    public static SongDetailResponseDto from(Song song, Storybook storybook) {
        return SongDetailResponseDto.builder()
                .id(song.getId())
                .title(song.getTitle())
                .lyric(song.getLyric())
                .description(song.getDescription())
                .songUrl(song.getSongUrl())
                .status(song.getStatus())
                .createdAt(song.getCreatedAt())
                .voiceId(song.getVoice().getId())
                .voiceName(song.getVoice().getName())
                .moodId(song.getMood().getId())
                .moodName(song.getMood().getName())
                .storybookId(storybook.getId())
                .storybookTitle(storybook.getTitle())
                .storybookDescription(storybook.getDescription())
                .coverUrl(storybook.getCoverUrl())
                .build();
    }
} 