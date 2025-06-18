package com.ssafy.aieng.domain.quiz.entity;

import com.ssafy.aieng.global.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "quiz_question")
public class QuizQuestion extends BaseEntity{

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "ans_word_id", nullable = false)
    private Integer ansWordId;

    @Column(name = "ans_image_url", nullable = false)
    private String ansImageUrl;

    @Column(name = "ch_1_id", nullable = false)
    private Integer ch1Id;

    @Column(name = "ch_2_id", nullable = false)
    private Integer ch2Id;

    @Column(name = "ch_3_id", nullable = false)
    private Integer ch3Id;

    @Column(name = "ch_4_id", nullable = false)
    private Integer ch4Id;

    @Column(name = "ans_ch_id", nullable = false)
    private Integer ansChId;

    @Column(name = "quiz_type")
    private String quizType;

    @Column(name = "question_text")
    private String question;

    @Column(name = "is_completed", nullable = false)
    private boolean isCompleted = false;

    public void markAsCompleted() {
        this.isCompleted = true;
    }

    public static QuizQuestion create(
            Quiz quiz,
            Integer ansWordId,
            String ansImageUrl,
            Integer ch1Id,
            Integer ch2Id,
            Integer ch3Id,
            Integer ch4Id,
            Integer ansChId,
            String quizType,
            String question
    ) {
        QuizQuestion q = new QuizQuestion();
        q.setQuiz(quiz);
        q.setAnsWordId(ansWordId);
        q.setAnsImageUrl(ansImageUrl);
        q.setCh1Id(ch1Id);
        q.setCh2Id(ch2Id);
        q.setCh3Id(ch3Id);
        q.setCh4Id(ch4Id);
        q.setAnsChId(ansChId);
        q.setQuizType(quizType);
        q.setQuestion(question);
        return q;
    }

    // 퀴즈 저장
    public void submitAnswer(Integer selectedChId) {
        if (this.ansChId.equals(selectedChId)) {
            this.isCompleted = true;
        }
    }
} 