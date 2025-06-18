package com.ssafy.aieng.domain.book.entity;

import com.ssafy.aieng.domain.learning.entity.Learning;
import com.ssafy.aieng.global.common.entity.BaseEntity;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "learning_storybook")
public class  LearningStorybook extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "storybook_id", nullable = false)
    private Storybook storybook;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learning_id", nullable = false)
    private Learning learning;

    @Column(name = "page_order", nullable = false)
    private Integer pageOrder;

    @Builder
    public LearningStorybook(Storybook storybook, Learning learning, Integer pageOrder) {
        this.storybook = storybook;
        this.learning = learning;
        this.pageOrder = pageOrder;
    }

    public void setStorybook(Storybook storybook) {
        this.storybook = storybook;
    }
}
