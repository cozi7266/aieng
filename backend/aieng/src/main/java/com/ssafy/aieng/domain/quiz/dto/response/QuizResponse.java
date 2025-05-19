package com.ssafy.aieng.domain.quiz.dto.response;

import com.ssafy.aieng.domain.quiz.entity.Quiz;
import com.ssafy.aieng.domain.quiz.entity.QuizQuestion;
import com.ssafy.aieng.domain.word.entity.Word;
import com.ssafy.aieng.domain.word.repository.WordRepository;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class QuizResponse {

    private Integer quizId;
    private LocalDateTime createdAt;
    private List<QuizQuestionResponse> questions;
    private Boolean isCompleted;

    public static QuizResponse of(Quiz quiz, WordRepository wordRepository) {
        QuizResponse response = new QuizResponse();
        response.setCreatedAt(quiz.getCreatedAt());
        response.setIsCompleted(quiz.isCompleted());

        List<QuizQuestionResponse> questionResponses = new ArrayList<>();
        for (QuizQuestion q : quiz.getQuestions()) {
            Word ans = wordRepository.findById(q.getAnsWordId()).orElse(null);
            Word ch1 = wordRepository.findById(q.getCh1Id()).orElse(null);
            Word ch2 = wordRepository.findById(q.getCh2Id()).orElse(null);
            Word ch3 = wordRepository.findById(q.getCh3Id()).orElse(null);
            Word ch4 = wordRepository.findById(q.getCh4Id()).orElse(null);

            QuizQuestionResponse dto = QuizQuestionResponse.of(
                    q.getId(),
                    ans != null ? ans.getWordEn() : null,
                    q.getAnsImageUrl(),
                    ch1 != null ? ch1.getWordEn() : null,
                    ch2 != null ? ch2.getWordEn() : null,
                    ch3 != null ? ch3.getWordEn() : null,
                    ch4 != null ? ch4.getWordEn() : null,
                    q.getAnsChId(),
                    q.isCompleted()
            );

            questionResponses.add(dto);
        }

        response.setQuestions(questionResponses);
        return response;
    }

}
