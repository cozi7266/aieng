package com.ssafy.aieng.domain.learning.repository;

import com.ssafy.aieng.domain.learning.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Integer> {

    Optional<Session> findByChildIdAndThemeId(Integer childId, Integer themeId);
}
