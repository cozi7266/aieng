package com.ssafy.aieng.domain.voice.entity;

import com.ssafy.aieng.domain.child.entity.Child;
import com.ssafy.aieng.global.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "voice")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Voice extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @Column(name = "name", length = 20, nullable = false)
    private String name;

    @Column(name = "description", length = 100)
    private String description;

    @Column(name = "audio_url", length = 255)
    private String audioUrl;

    @Builder
    public Voice(Child child, String name, String description, String audioUrl) {
        this.child = child;
        this.name = name;
        this.description = description;
        this.audioUrl = audioUrl;
    }
}
