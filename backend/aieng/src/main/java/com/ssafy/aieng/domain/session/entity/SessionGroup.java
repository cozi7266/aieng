package com.ssafy.aieng.domain.session.entity;

import com.ssafy.aieng.domain.learning.entity.Learning;
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
@Table(name = "session_group")
public class SessionGroup extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @OneToMany(mappedBy = "sessionGroup")
    private List<Learning> learnings;

    @Column(name = "group_order", nullable = false)
    private Integer groupOrder;

    @Column(name = "total_count")
    private Integer totalWordCount;

    @Column(name = "learned_count")
    private Integer learnedWordCount;

    @Column(name = "completed", nullable = false)
    private boolean completed;

    @Column(name = "learning_started_at")
    private LocalDateTime startedAt;

    @Column(name = "learning_finished_at")
    private LocalDateTime finishedAt;

    public void updateCompletionStatus() {
        if (this.learnings != null && this.learnings.stream().allMatch(Learning::isLearned)) {
            this.completed = true;
            this.finishedAt = LocalDateTime.now();
        }
    }

    public void addLearning(Learning learning) {
        this.learnings.add(learning);
        learning.setSessionGroup(this);
    }

    public void updateCounts() {
        this.totalWordCount = (learnings == null) ? 0 : learnings.size();
        this.learnedWordCount = (int) learnings.stream().filter(Learning::isLearned).count();
    }

    public void incrementLearnedCount() {
        if (this.learnedWordCount == null) this.learnedWordCount = 0;

        // 처음 학습 시작할 때만 기록
        if (this.learnedWordCount == 1 && this.startedAt == null) {
            this.startedAt = LocalDateTime.now();
        }

        this.learnedWordCount++;
        updateCompletionStatus(); // 그룹 전체 완료 여부 자동 체크
    }

}
