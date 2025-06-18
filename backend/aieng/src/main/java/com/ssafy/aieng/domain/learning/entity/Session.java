package com.ssafy.aieng.domain.learning.entity;

import com.ssafy.aieng.domain.child.entity.Child;
import com.ssafy.aieng.domain.theme.entity.Theme;
import com.ssafy.aieng.global.common.entity.BaseEntity;
import lombok.*;

import jakarta.persistence.*;
import java.time.LocalDateTime;


@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "session")
public class Session extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "theme_id", nullable = false)
    private Theme theme;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    @Column(name = "word_count", nullable = false)
    private Integer wordCount;

    public void setWordCount(int count) {
        this.wordCount = count;
    }
} 