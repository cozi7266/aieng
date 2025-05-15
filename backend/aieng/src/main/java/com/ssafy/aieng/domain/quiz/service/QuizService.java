
package com.ssafy.aieng.domain.quiz.service;

import com.ssafy.aieng.domain.learning.entity.Learning;
import com.ssafy.aieng.domain.learning.repository.LearningRepository;
import com.ssafy.aieng.domain.quiz.dto.response.QuizResponse;
import com.ssafy.aieng.domain.quiz.entity.Quiz;
import com.ssafy.aieng.domain.quiz.entity.QuizQuestion;
import com.ssafy.aieng.domain.quiz.repository.QuizRepository;
import com.ssafy.aieng.domain.session.entity.Session;
import com.ssafy.aieng.domain.session.repository.SessionRepository;
import com.ssafy.aieng.domain.word.entity.Word;
import com.ssafy.aieng.domain.word.repository.WordRepository;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final SessionRepository sessionRepository;
    private final LearningRepository learningRepository;
    private final QuizRepository quizRepository;
    private final WordRepository wordRepository;

    // 퀴즈 생성 가능 여부: 세션의 모든 단어가 학습 완료된 경우에만 허용
    @Transactional(readOnly = true)
    public boolean checkQuizAvailability(Integer userId, Integer sessionId) {

        // 1. 세션 인증
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.SESSION_NOT_FOUND));

        // 2, 사용자 인증 (소유자 확인)
        if (!session.getChild().getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // 학습 완료 여부 확인
        long learned = learningRepository.countBySessionIdAndLearned(sessionId, true);
        return learned == session.getTotalWordCount();
    }

    // 퀴즈 생성
    @Transactional
    public QuizResponse createQuiz(Integer userId, Integer sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.SESSION_NOT_FOUND));

        // 세션 소유자 확인
        if (!session.getChild().getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // 이미 퀴즈 존재 여부 확인
        if (quizRepository.existsBySession(session)) {
            throw new CustomException(ErrorCode.QUIZ_ALREADY_EXISTS);
        }

        // 세션 내 단어 6개 모두 학습 완료 여부 확인
        if (!session.getTotalWordCount().equals(session.getLearnedWordCount())) {
            throw new CustomException(ErrorCode.QUIZ_CREATION_FAILED);
        }

        // 퀴즈 생성
        Quiz quiz = Quiz.createQuiz(session);

        List<Learning> learnedWords = learningRepository.findAllBySessionIdAndLearnedTrue(sessionId);
        Collections.shuffle(learnedWords);
        List<Learning> selected = learnedWords.subList(0, 4);

        for (Learning learning : selected) {
            Word correct = learning.getWord();

            // 보기 후보 중 정답 제외하고 3개 오답 랜덤 추출
            List<Word> allWords = wordRepository.findAll();
            List<Word> incorrectOptions = allWords.stream()
                    .filter(w -> !w.getId().equals(correct.getId()))
                    .collect(Collectors.toList());

            Collections.shuffle(incorrectOptions);

            List<Word> options = new ArrayList<>();
            options.add(correct);  // 정답 포함
            options.addAll(incorrectOptions.subList(0, 3));
            Collections.shuffle(options); // 보기 순서 랜덤

            int correctIdx = options.indexOf(correct) + 1; // 보기 중 정답의 위치 (1~4)

            // QuizQuestion 생성 - 정적 팩토리 메서드 사용
            QuizQuestion question = QuizQuestion.create(
                    quiz,
                    correct.getId(),
                    correct.getImgUrl(),
                    options.get(0).getId(),
                    options.get(1).getId(),
                    options.get(2).getId(),
                    options.get(3).getId(),
                    correctIdx,
                    "image_matching",
                    "Which image matches the word?"
            );

            quiz.getQuestions().add(question);
        }

        quizRepository.save(quiz);
        return QuizResponse.of(quiz, wordRepository);

    }


    // 퀴즈 조회
    @Transactional(readOnly = true)
    public QuizResponse getQuizBySessionId(Integer userId, Integer sessionId) {
        Quiz quiz = quizRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.QUIZ_NOT_FOUND));

        // 세션 소유자 확인
        Session session = quiz.getSession();
        if (!session.getChild().getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        return QuizResponse.of(quiz, wordRepository);

    }

}
