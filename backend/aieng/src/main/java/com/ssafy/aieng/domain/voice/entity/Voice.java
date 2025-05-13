package com.ssafy.aieng.domain.voice.entity;

import com.ssafy.aieng.global.common.entity.BaseEntity;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;

@Entity
@Table(name = "voice")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Voice extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "child_id")
    private Integer childId;

    @Column(name = "name", length = 20, nullable = false)
    private String name;

    @Column(name = "description", length = 100)
    private String description;

    @Column(name = "audio_url", length = 255)
    private String audioUrl;

    @Builder
    public Voice(Integer childId, String name, String description, String audioUrl) {
        this.childId = childId;
        this.name = name;
        this.description = description;
        this.audioUrl = audioUrl;
    }
} 