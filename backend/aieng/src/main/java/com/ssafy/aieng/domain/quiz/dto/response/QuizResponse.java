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
    private Integer id;
    private Integer sessionId;
    private LocalDateTime createdAt;
    private List<QuizQuestionResponse> questions;

    public static QuizResponse of(Quiz quiz, WordRepository wordRepository) {
        QuizResponse response = new QuizResponse();
        response.setId(quiz.getId());
        response.setSessionId(quiz.getSession().getId());
        response.setCreatedAt(quiz.getCreatedAt());

        List<QuizQuestionResponse> questionResponses = new ArrayList<>();
        for (QuizQuestion q : quiz.getQuestions()) {
            Word ans = wordRepository.findById(q.getAnsWordId()).orElse(null);
            Word ch1 = wordRepository.findById(q.getCh1Id()).orElse(null);
            Word ch2 = wordRepository.findById(q.getCh2Id()).orElse(null);
            Word ch3 = wordRepository.findById(q.getCh3Id()).orElse(null);
            Word ch4 = wordRepository.findById(q.getCh4Id()).orElse(null);

            QuizQuestionResponse dto = new QuizQuestionResponse();
            dto.setId(q.getId());
            dto.setAnsImageUrl(q.getAnsImageUrl());
            dto.setAnsChId(q.getAnsChId());
            dto.setAnsWord(ans != null ? ans.getWordEn() : null);
            dto.setCh1Word(ch1 != null ? ch1.getWordEn() : null);
            dto.setCh2Word(ch2 != null ? ch2.getWordEn() : null);
            dto.setCh3Word(ch3 != null ? ch3.getWordEn() : null);
            dto.setCh4Word(ch4 != null ? ch4.getWordEn() : null);

            questionResponses.add(dto);
        }

        response.setQuestions(questionResponses);
        return response;
    }
}
