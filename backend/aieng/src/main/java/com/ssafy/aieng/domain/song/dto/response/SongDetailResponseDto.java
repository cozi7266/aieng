package com.ssafy.aieng.domain.song.dto.response;

import com.ssafy.aieng.domain.song.entity.Song;
import com.ssafy.aieng.domain.song.entity.SongStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SongDetailResponseDto {

    private Integer sessionId;
    private Integer songId;
    private String title;
    private String lyric;
    private String description;
    private String bookCover;
    private String themeEn;
    private String themeKo;
    private Boolean isLiked;
    private String songUrl;
    private SongStatus status;
    private Integer duration;
    private LocalDateTime createdAt;
    private Integer moodId;
    private String moodName;

    public static SongDetailResponseDto from(
            Song song,
            String bookCover,
            Boolean isLiked
    ) {
        // Null-safe theme 처리
        String themeEn = null;
        String themeKo = null;
        if (song.getSession() != null && song.getSession().getTheme() != null) {
            themeEn = song.getSession().getTheme().getThemeEn();
            themeKo = song.getSession().getTheme().getThemeKo();
        }

        return SongDetailResponseDto.builder()
                .sessionId(song.getSession() != null ? song.getSession().getId() : null)
                .songId(song.getId())
                .title(song.getTitle())
                .lyric(song.getLyric())
                .description(song.getDescription())
                .bookCover(bookCover)
                .themeEn(themeEn)
                .themeKo(themeKo)
                .isLiked(isLiked)
                .songUrl(song.getSongUrl())
                .status(song.getStatus())
                .duration(song.getDuration())
                .createdAt(song.getCreatedAt())
                .moodId(song.getMood() != null ? song.getMood().getId() : null)
                .moodName(song.getMood() != null ? song.getMood().getName() : null)
                .build();
    }
}
