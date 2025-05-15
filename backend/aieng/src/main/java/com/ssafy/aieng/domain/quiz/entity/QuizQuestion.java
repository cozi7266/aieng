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
} 