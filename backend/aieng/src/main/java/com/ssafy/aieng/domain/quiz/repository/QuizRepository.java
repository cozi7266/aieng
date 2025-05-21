package com.ssafy.aieng.domain.quiz.repository;

import com.ssafy.aieng.domain.quiz.entity.Quiz;
import com.ssafy.aieng.domain.session.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Integer> {

    // sessionId로 Quiz 조회
    Optional<Quiz> findBySessionId(Integer sessionId);

    // 특정 Session으로 Quiz 존재 여부 확인
    boolean existsBySession(Session session);
} 