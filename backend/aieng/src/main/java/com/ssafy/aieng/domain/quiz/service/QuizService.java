package com.ssafy.aieng.domain.quiz.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.aieng.domain.learning.entity.Learning;
import com.ssafy.aieng.domain.learning.entity.Session;
import com.ssafy.aieng.domain.learning.repository.LearningRepository;
import com.ssafy.aieng.domain.learning.repository.SessionRepository;
import com.ssafy.aieng.domain.quiz.dto.QuizCreateRequest;
import com.ssafy.aieng.domain.quiz.dto.QuizResponse;
import com.ssafy.aieng.domain.quiz.entity.Quiz;
import com.ssafy.aieng.domain.quiz.entity.QuizQuestion;
import com.ssafy.aieng.domain.quiz.repository.QuizRepository;
import com.ssafy.aieng.domain.user.entity.User;
import com.ssafy.aieng.domain.user.repository.UserRepository;
import com.ssafy.aieng.domain.word.entity.Word;
import com.ssafy.aieng.domain.word.repository.WordRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuizService {
    private final QuizRepository quizRepository;
    private final LearningRepository learningRepository;
    private final SessionRepository sessionRepository;
    private final Random random = new Random();
    private final UserRepository userRepository;
    private final WordRepository wordRepository;
    private static final int REQUIRED_LEARNED_WORDS = 5;
    private static final int TOTAL_WORDS = 6;

    @Transactional(readOnly = true)
    public boolean checkQuizAvailability(String userId) {
        User user = userRepository.findById(Integer.parseInt(userId))
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        long learnedWordsCount = learningRepository.countBySessionChildParentAndLearned(user, true);

        return learnedWordsCount >= REQUIRED_LEARNED_WORDS;
    }

    @Transactional
    public QuizResponse createQuiz(QuizCreateRequest request) {
        // 1. 해당 session의 학습 완료된 단어들 조회
        List<Learning> learnedWords = learningRepository.findBySessionIdAndLearnedTrue(request.getSessionId());
        
        if (learnedWords.size() < REQUIRED_LEARNED_WORDS) {
            throw new IllegalStateException("학습 완료된 단어가 5개 미만입니다.");
        }

        // 2. 퀴즈 생성
        Quiz quiz = new Quiz();
        Session session = sessionRepository.findById(request.getSessionId().intValue())
                .orElseThrow(() -> new RuntimeException("세션을 찾을 수 없습니다."));
        quiz.setSession(session);
        quiz = quizRepository.save(quiz);

        // 3. 퀴즈 문제 생성 (학습 완료된 단어들 중에서)
        List<QuizQuestion> questions = new ArrayList<>();
        Set<Integer> usedAnswerWordIds = new HashSet<>();  // 이미 정답으로 사용된 단어 ID 추적
        
        for (Learning wordLearning : learnedWords) {
            // 이미 정답으로 사용된 단어는 건너뛰기
            if (usedAnswerWordIds.contains(wordLearning.getWord().getId())) {
                continue;
            }
            
            // 보기 단어 선택 (정답 단어 제외)
            List<Learning> otherWords = new ArrayList<>(learnedWords);
            otherWords.remove(wordLearning);
            Collections.shuffle(otherWords);
            
            // 보기 단어가 부족한 경우 처리
            if (otherWords.size() < 3) {
                throw new IllegalStateException("보기로 사용할 단어가 부족합니다. 최소 4개의 학습 완료된 단어가 필요합니다.");
            }
            
            List<Learning> choices = otherWords.subList(0, 3);

            // 정답 위치 랜덤 설정
            int answerIdx = random.nextInt(4) + 1;

            QuizQuestion question = new QuizQuestion();
            question.setQuiz(quiz);
            question.setAnsWordId(wordLearning.getWord().getId());
            question.setAnsImageUrl(wordLearning.getWord().getImgUrl());
            
            // 보기 순서 설정
            List<Integer> choiceIds = new ArrayList<>();
            int choiceIndex = 0;
            for (int i = 0; i < 4; i++) {
                if (i + 1 == answerIdx) {
                    choiceIds.add(wordLearning.getWord().getId());
                } else {
                    choiceIds.add(choices.get(choiceIndex++).getWord().getId());
                }
            }
            
            question.setCh1Id(choiceIds.get(0));
            question.setCh2Id(choiceIds.get(1));
            question.setCh3Id(choiceIds.get(2));
            question.setCh4Id(choiceIds.get(3));
            question.setAnsChId(answerIdx);
            
            questions.add(question);
            usedAnswerWordIds.add(wordLearning.getWord().getId());  // 사용된 정답 단어 ID 추가
        }
        quiz.setQuestions(questions);

        // 4. 응답 생성
        return convertToResponse(quiz);
    }

    private QuizResponse convertToResponse(Quiz quiz) {
        QuizResponse response = new QuizResponse();
        response.setId(quiz.getId());
        response.setSessionId(quiz.getSession().getId());
        response.setCreatedAt(quiz.getCreatedAt());
        
        List<QuizResponse.QuizQuestionResponse> questionResponses = new ArrayList<>();
        for (QuizQuestion question : quiz.getQuestions()) {
            QuizResponse.QuizQuestionResponse questionResponse = new QuizResponse.QuizQuestionResponse();
            questionResponse.setId(question.getId());
            
            // 정답 단어 설정
            questionResponse.setAnsWord(wordRepository.findById(question.getAnsWordId())
                    .orElseThrow(() -> new RuntimeException("단어를 찾을 수 없습니다."))
                    .getWordEn());
            
            questionResponse.setAnsImageUrl(question.getAnsImageUrl());
            
            // 보기 단어들 설정
            questionResponse.setCh1Word(wordRepository.findById(question.getCh1Id())
                    .orElseThrow(() -> new RuntimeException("단어를 찾을 수 없습니다."))
                    .getWordEn());
            questionResponse.setCh2Word(wordRepository.findById(question.getCh2Id())
                    .orElseThrow(() -> new RuntimeException("단어를 찾을 수 없습니다."))
                    .getWordEn());
            questionResponse.setCh3Word(wordRepository.findById(question.getCh3Id())
                    .orElseThrow(() -> new RuntimeException("단어를 찾을 수 없습니다."))
                    .getWordEn());
            questionResponse.setCh4Word(wordRepository.findById(question.getCh4Id())
                    .orElseThrow(() -> new RuntimeException("단어를 찾을 수 없습니다."))
                    .getWordEn());
            
            questionResponses.add(questionResponse);
        }
        response.setQuestions(questionResponses);
        
        return response;
    }
} 