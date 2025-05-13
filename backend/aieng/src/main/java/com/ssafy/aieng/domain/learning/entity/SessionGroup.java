package com.ssafy.aieng.domain.learning.entity;

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

    @Column(name = "completed", nullable = false)
    private boolean completed;

    @Column(name = "learning_started_at")
    private LocalDateTime startedAt;

    @Column(name = "learning_finished_at")
    private LocalDateTime finishedAt;

    public void updateCompletionStatus() {
        this.completed = learnings != null && learnings.stream().allMatch(Learning::isLearned);
    }

    public void addLearning(Learning learning) {
        this.learnings.add(learning);
        learning.setSessionGroup(this);
    }

}
