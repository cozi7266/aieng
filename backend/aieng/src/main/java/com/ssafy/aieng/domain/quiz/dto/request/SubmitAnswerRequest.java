package com.ssafy.aieng.domain.quiz.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SubmitAnswerRequest {
    private Integer quizQuestionId;
    private Integer selectedChoiceId;
}
