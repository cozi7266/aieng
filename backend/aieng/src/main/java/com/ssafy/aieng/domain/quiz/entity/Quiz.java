package com.ssafy.aieng.domain.quiz.entity;

import com.ssafy.aieng.domain.session.entity.Session;
import com.ssafy.aieng.global.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quiz")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Quiz extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", unique = true)
    private Session session;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<QuizQuestion> questions = new ArrayList<>();

    @Column(name = "is_completed", nullable = false)
    private boolean isCompleted;

    public void markAsCompleted() {
        this.isCompleted = true;
    }

    public void checkAndMarkQuizComplete() {
        if (questions.stream().allMatch(QuizQuestion::isCompleted)) {
            markAsCompleted();
        }
    }

    public static Quiz createQuiz(Session session) {
        Quiz quiz = new Quiz();
        quiz.setSession(session);
        return quiz;
    }
} 