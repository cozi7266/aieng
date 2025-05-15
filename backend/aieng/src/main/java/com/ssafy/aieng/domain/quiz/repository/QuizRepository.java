package com.ssafy.aieng.domain.quiz.repository;

import com.ssafy.aieng.domain.quiz.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Integer> {
    Optional<Quiz> findBySessionId(Integer sessionId);
} 