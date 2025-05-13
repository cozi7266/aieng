package com.ssafy.aieng.domain.learning.entity;

import com.ssafy.aieng.domain.child.entity.Child;
import com.ssafy.aieng.domain.theme.entity.Theme;
import com.ssafy.aieng.global.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

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

    @OneToMany(mappedBy = "session")
    private List<Learning> learnings;

    @OneToMany(mappedBy = "session")
    private List<SessionGroup> sessionGroups;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    @Column(name = "word_count", nullable = false)
    private Integer wordCount;

    public void setWordCount(int count) {
        this.wordCount = count;
    }

    public static Session of(Child child, Theme theme) {
        return Session.builder()
                .child(child)
                .theme(theme)
                .startedAt(LocalDateTime.now())
                .wordCount(0)
                .build();
    }

    public void addLearning(Learning learning) {
        this.learnings.add(learning);
        learning.setSession(this);
    }
}
