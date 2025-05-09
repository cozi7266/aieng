package com.ssafy.aieng.domain.book.entity;

import com.ssafy.aieng.global.common.Entity.BaseEntity;
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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "child_id", nullable = false)
    private Integer childId;

    @Column(name = "cover_url", nullable = false)
    private String coverUrl;

    @Column(nullable = false)
    private String title;

    @Column
    private String description;

    @OneToMany(mappedBy = "storybook", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LearningStorybook> learningStorybooks = new ArrayList<>();

    @Builder
    public Storybook(Integer childId, String coverUrl, String title, String description) {
        this.childId = childId;
        this.coverUrl = coverUrl;
        this.title = title;
        this.description = description;
    }

    public void addLearningStorybook(LearningStorybook learningStorybook) {
        this.learningStorybooks.add(learningStorybook);
    }
} 