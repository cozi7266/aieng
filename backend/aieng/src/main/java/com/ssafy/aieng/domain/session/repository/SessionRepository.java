package com.ssafy.aieng.domain.session.repository;

import com.ssafy.aieng.domain.learning.entity.Learning;
import com.ssafy.aieng.domain.session.entity.Session;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Integer> {

    Optional<Session> findByChildIdAndThemeId(Integer childId, Integer themeId);

    Optional<Session> findTopByChildIdOrderByCreatedAtDesc(Integer childId);

    Optional<Session> findByIdAndDeletedFalse(Integer id);

    Page<Session> findAllByChildIdAndDeletedFalse(Integer childId, Pageable pageable);

    Optional<Session> findByChildIdAndThemeIdAndFinishedAtIsNull(Integer childId, Integer themeId);

}
