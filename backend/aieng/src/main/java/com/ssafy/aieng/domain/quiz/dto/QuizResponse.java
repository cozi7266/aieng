package com.ssafy.aieng.domain.quiz.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuizResponse {
    private Integer id;
    private Integer sessionId;
    private LocalDateTime createdAt;
    private List<QuizQuestionResponse> questions;

    @Getter
    @Setter
    public static class QuizQuestionResponse {
        private Integer id;
        private String ansWord;  // 정답 영단어
        private String ansImageUrl;
        private String ch1Word;  // 보기1 영단어
        private String ch2Word;  // 보기2 영단어
        private String ch3Word;  // 보기3 영단어
        private String ch4Word;  // 보기4 영단어
    }
} 