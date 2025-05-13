package com.ssafy.aieng.domain.learning.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.aieng.domain.learning.repository.LearningRepository;
import com.ssafy.aieng.domain.user.entity.User;
import com.ssafy.aieng.domain.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {

    private final UserRepository userRepository;
    private final LearningRepository learningRepository;
    private static final int REQUIRED_LEARNED_WORDS = 5;
    private static final int TOTAL_WORDS = 6;

    @Override
    @Transactional(readOnly = true)
    public boolean checkQuizAvailability(String userId) {
        User user = userRepository.findById(Integer.parseInt(userId))
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        long learnedWordsCount = learningRepository.countBySessionChildParentAndLearned(user, true);
        
        return learnedWordsCount >= REQUIRED_LEARNED_WORDS;
    }
} 