package com.ssafy.aieng.domain.quiz.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuizQuestionResponse {
    private Integer quizQuestionId;
    private String ansWord;
    private String ansImageUrl;
    private String ch1Word;
    private String ch2Word;
    private String ch3Word;
    private String ch4Word;
    private Integer ansChId;     // 정답 보기 번호 (1~4)
    private Boolean isCompleted; // 사용자가 이 문제를 푼 상태

    public static QuizQuestionResponse of(
            Integer quizQuestionId,
            String ansWord,
            String ansImageUrl,
            String ch1Word,
            String ch2Word,
            String ch3Word,
            String ch4Word,
            Integer ansChId,
            Boolean isCompleted
    ) {
        QuizQuestionResponse dto = new QuizQuestionResponse();
        dto.quizQuestionId = quizQuestionId;
        dto.ansWord = ansWord;
        dto.ansImageUrl = ansImageUrl;
        dto.ch1Word = ch1Word;
        dto.ch2Word = ch2Word;
        dto.ch3Word = ch3Word;
        dto.ch4Word = ch4Word;
        dto.ansChId = ansChId;
        dto.isCompleted = isCompleted;
        return dto;
    }

}
