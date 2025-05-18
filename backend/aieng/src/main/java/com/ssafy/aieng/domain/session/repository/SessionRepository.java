package com.ssafy.aieng.domain.session.repository;

import com.ssafy.aieng.domain.session.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Integer> {


    Optional<Session> findByIdAndDeletedFalse(Integer id);

    Optional<Session> findByChildIdAndThemeIdAndFinishedAtIsNull(Integer childId, Integer themeId);

    List<Session> findAllByChildIdAndDeletedFalse(Integer childId);

    Optional<Session> findTopByChildIdAndThemeIdAndDeletedFalseOrderByStartedAtDesc(Integer childId, Integer themeId);

    // childId와 storybookId(또는 themeId)가 일치하고, finishedAt이 null이 아닌 세션 조회
    Optional<Session> findFirstByChildIdAndThemeIdAndFinishedAtIsNotNull(Integer childId, Integer themeId);
}
