package com.ssafy.aieng.domain.book.entity;

import com.ssafy.aieng.domain.child.entity.Child;
import com.ssafy.aieng.global.common.entity.BaseEntity;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "storybook")
public class Storybook extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @Column(name = "cover_url", nullable = false)
    private String coverUrl;

    @Column(nullable = false)
    private String title;

    @Column
    private String description;

    @OneToMany(mappedBy = "storybook", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LearningStorybook> learningStorybooks = new ArrayList<>();

    @Builder
    public Storybook(Child child, String coverUrl, String title, String description) {
        this.child = child;
        this.coverUrl = coverUrl;
        this.title = title;
        this.description = description;
    }

    public void addLearningStorybook(LearningStorybook learningStorybook) {
        this.learningStorybooks.add(learningStorybook);
        learningStorybook.setStorybook(this); // 양방향 유지
    }




}
