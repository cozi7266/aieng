package com.ssafy.aieng.domain.session.entity;

import com.ssafy.aieng.domain.child.entity.Child;
import com.ssafy.aieng.domain.learning.entity.Learning;
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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @ManyToOne(fetch = FetchType.EAGER)
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
    private Integer totalWordCount;

    @Column(name = "learned_count", nullable = false)
    private Integer learnedWordCount;

    @Column(name = "progress_rate")
    private Integer progressRate;

    // 학습 세션 생성
    public static Session of(Child child, Theme theme) {
        return Session.builder()
                .child(child)
                .theme(theme)
                .startedAt(LocalDateTime.now())
                .totalWordCount(0)
                .learnedWordCount(0)
                .progressRate(0)
                .build();
    }

    // 총 단어 수 설정 + 진행률 초기화
    public void setTotalWordCount(int count) {
        this.totalWordCount = count;
        updateProgressRate();
    }

    // 학습 단어 수 증가 / 감소 + 진행률 자동 업데이트
    public void incrementLearnedCount() {
        this.learnedWordCount++;
        updateProgressRate();
    }

    public void decrementLearnedCount() {
        if (this.learnedWordCount > 0) {
            this.learnedWordCount--;
            updateProgressRate();
        }
    }

    // 진행률 계산
    public void updateProgressRate() {
        if (totalWordCount != null && totalWordCount > 0) {
            this.progressRate = (int) ((learnedWordCount * 100.0) / totalWordCount);
        } else {
            this.progressRate = 0;
        }
    }

    // ✅ 연관관계 편의 메서드
    public void addLearning(Learning learning) {
        this.learnings.add(learning);
        learning.setSession(this);
    }
}
