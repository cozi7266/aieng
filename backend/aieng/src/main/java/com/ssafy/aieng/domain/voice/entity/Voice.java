package com.ssafy.aieng.domain.voice.entity;


import com.ssafy.aieng.global.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "voice")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Voice extends BaseEntity {

    @Column(name = "name", length = 20, nullable = false)
    private String name;

    @Column(name = "description", length = 100)
    private String description;

    @Column(name = "audio_url", length = 255)
    private String audioUrl;

    // child_id를 컬럼으로만 둠 (nullable)
    @Column(name = "child_id", nullable = true)
    private Integer childId;

    // 필요하다면 생성자/빌더에 childId 추가
    @Builder
    public Voice(String name, String description, String audioUrl, Integer childId) {
        this.name = name;
        this.description = description;
        this.audioUrl = audioUrl;
        this.childId = childId;
    }
}
