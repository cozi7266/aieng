package com.ssafy.aieng.domain.song.entity;

import com.ssafy.aieng.domain.session.entity.Session;
import com.ssafy.aieng.domain.mood.entity.Mood;
import com.ssafy.aieng.global.common.entity.BaseEntity;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;

@Entity
@Table(name = "custom_song")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Song extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mood_id", nullable = false)
    private Mood mood;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @Column(name = "title", length = 50, nullable = false)
    private String title;

    @Column(name = "lyric", columnDefinition = "TEXT", nullable = false)
    private String lyric;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "song_url", length = 255)
    private String songUrl;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private SongStatus status;

    @Builder
    public Song(Session session, Mood mood, String title, String lyric, String description, String songUrl) {
        this.session = session;
        this.mood = mood;
        this.title = title;
        this.lyric = lyric;
        this.description = description;
        this.songUrl = songUrl;
        this.status = SongStatus.REQUESTED;
    }

} 