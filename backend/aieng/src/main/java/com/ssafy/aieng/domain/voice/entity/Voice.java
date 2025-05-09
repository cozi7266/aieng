package com.ssafy.aieng.domain.voice.entity;

import com.ssafy.aieng.global.common.Entity.BaseEntity;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "voice")
public class Voice extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "child_id", nullable = false)
    private Integer childId;

    @Column(name = "name", nullable = false, length = 20)
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