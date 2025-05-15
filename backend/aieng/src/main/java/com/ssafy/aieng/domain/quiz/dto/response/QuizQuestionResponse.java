package com.ssafy.aieng.domain.quiz.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuizQuestionResponse {
    private Integer id;
    private String ansWord;
    private String ansImageUrl;
    private String ch1Word;
    private String ch2Word;
    private String ch3Word;
    private String ch4Word;
    private Integer ansChId; // 정답 보기 번호 (1~4)

    public static QuizQuestionResponse of(
            Integer id,
            String ansWord,
            String ansImageUrl,
            String ch1Word,
            String ch2Word,
            String ch3Word,
            String ch4Word,
            Integer ansChId
    ) {
        QuizQuestionResponse dto = new QuizQuestionResponse();
        dto.setId(id);
        dto.setAnsWord(ansWord);
        dto.setAnsImageUrl(ansImageUrl);
        dto.setCh1Word(ch1Word);
        dto.setCh2Word(ch2Word);
        dto.setCh3Word(ch3Word);
        dto.setCh4Word(ch4Word);
        dto.setAnsChId(ansChId);
        return dto;
    }
}

