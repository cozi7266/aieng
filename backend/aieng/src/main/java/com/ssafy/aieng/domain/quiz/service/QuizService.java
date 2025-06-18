package com.ssafy.aieng.domain.quiz.service;

import com.ssafy.aieng.domain.learning.entity.Learning;
import com.ssafy.aieng.domain.learning.repository.LearningRepository;
import com.ssafy.aieng.domain.quiz.dto.response.QuizResponse;
import com.ssafy.aieng.domain.quiz.entity.Quiz;
import com.ssafy.aieng.domain.quiz.entity.QuizQuestion;
import com.ssafy.aieng.domain.quiz.repository.QuizQuestionRepository;
import com.ssafy.aieng.domain.quiz.repository.QuizRepository;
import com.ssafy.aieng.domain.session.entity.Session;
import com.ssafy.aieng.domain.session.repository.SessionRepository;
import com.ssafy.aieng.domain.word.entity.Word;
import com.ssafy.aieng.domain.word.repository.WordRepository;
import com.ssafy.aieng.domain.child.repository.ChildRepository;
import com.ssafy.aieng.domain.child.entity.Child;
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
    private final QuizQuestionRepository quizQuestionRepository;
    private final WordRepository wordRepository;
    private final ChildRepository childRepository;

    //  childId가 userId에 속하는지 검증하는 공통 메서드
    private void validateChildOwnership(Integer userId, Integer childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));
        if (!child.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }
    }

    // 퀴즈 생성 가능 여부: 세션의 모든 단어가 학습 완료된 경우에만 허용
    @Transactional(readOnly = true)
    public boolean checkQuizAvailability(Integer userId, Integer sessionId, Integer childId) {
        validateChildOwnership(userId, childId);

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.SESSION_NOT_FOUND));

        if (!session.getChild().getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        long learned = learningRepository.countBySessionIdAndLearned(sessionId, true);
        return learned == session.getTotalWordCount();
    }

    // 퀴즈 생성
    @Transactional
    public QuizResponse createQuiz(Integer userId, Integer sessionId, Integer childId) {
        validateChildOwnership(userId, childId);

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.SESSION_NOT_FOUND));

        if (!session.getChild().getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        if (quizRepository.existsBySession(session)) {
            throw new CustomException(ErrorCode.QUIZ_ALREADY_EXISTS);
        }

        if (!session.getTotalWordCount().equals(session.getLearnedWordCount())) {
            throw new CustomException(ErrorCode.QUIZ_CREATION_FAILED);
        }

        Quiz quiz = Quiz.createQuiz(session);

        List<Learning> learnedWords = learningRepository.findAllBySessionIdAndLearnedTrue(sessionId);
        Collections.shuffle(learnedWords);
        List<Learning> selected = learnedWords.subList(0, 4);

        for (Learning learning : selected) {
            Word correct = learning.getWord();

            List<Word> allWords = wordRepository.findAll();
            List<Word> incorrectOptions = allWords.stream()
                    .filter(w -> !w.getId().equals(correct.getId()))
                    .collect(Collectors.toList());
            Collections.shuffle(incorrectOptions);

            List<Word> options = new ArrayList<>();
            options.add(correct);
            options.addAll(incorrectOptions.subList(0, 3));
            Collections.shuffle(options);

            int correctIdx = options.indexOf(correct) + 1;

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
    public QuizResponse getQuizBySessionId(Integer userId, Integer sessionId, Integer childId) {
        validateChildOwnership(userId, childId);

        Quiz quiz = quizRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.QUIZ_NOT_FOUND));

        Session session = quiz.getSession();
        if (!session.getChild().getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        return QuizResponse.of(quiz, wordRepository);
    }

    // 퀴즈 풀기
    @Transactional
    public boolean submitAnswer(Integer userId, Integer childId, Integer quizQuestionId, Integer selectedChId) {
        QuizQuestion question = quizQuestionRepository.findById(quizQuestionId)
                .orElseThrow(() -> new CustomException(ErrorCode.QUIZ_NOT_FOUND));

        Session session = question.getQuiz().getSession();
        Child child = session.getChild();

        if (!child.getId().equals(childId) || !child.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        if (question.isCompleted()) {
            throw new CustomException(ErrorCode.QUESTION_ALREADY_COMPLETED);
        }

        // 답안 처리
        boolean isCorrect = question.getAnsChId().equals(selectedChId);
        question.submitAnswer(selectedChId);

        question.getQuiz().checkAndMarkQuizComplete();

        session.markQuizDone();

        return isCorrect;
    }



}
