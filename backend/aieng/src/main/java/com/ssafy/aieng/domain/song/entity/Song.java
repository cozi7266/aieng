package com.ssafy.aieng.domain.song.entity;

import com.ssafy.aieng.domain.child.entity.Child;
import com.ssafy.aieng.domain.voice.entity.Voice;
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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "storybook_id", nullable = false)
    private Integer storybookId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voice_id", nullable = false)
    private Voice voice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mood_id", nullable = false)
    private Mood mood;

    @Column(name = "title", length = 50, nullable = false)
    private String title;

    @Column(name = "lyric", length = 200, nullable = false)
    private String lyric;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "song_url", length = 255)
    private String songUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SongStatus status = SongStatus.CREATED;

    @Builder
    public Song(Integer storybookId, Voice voice, Mood mood, String title, String lyric, String description, String songUrl) {
        this.storybookId = storybookId;
        this.voice = voice;
        this.mood = mood;
        this.title = title;
        this.lyric = lyric;
        this.description = description;
        this.songUrl = songUrl;
        this.status = SongStatus.CREATED;
    }
} 