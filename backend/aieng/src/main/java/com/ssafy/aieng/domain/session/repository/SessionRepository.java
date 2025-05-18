package com.ssafy.aieng.domain.session.repository;

import com.ssafy.aieng.domain.session.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Integer> {


    Optional<Session> findByIdAndDeletedFalse(Integer id);

    Optional<Session> findByChildIdAndThemeIdAndFinishedAtIsNull(Integer childId, Integer themeId);

    List<Session> findAllByChildIdAndDeletedFalse(Integer childId);

    Optional<Session> findTopByChildIdAndThemeIdAndDeletedFalseOrderByStartedAtDesc(Integer childId, Integer themeId);



        @Query("SELECT s FROM Session s " +
                "JOIN s.learnings l " +
                "JOIN l.learningStorybooks ls " +
                "WHERE s.child.id = :childId AND ls.storybook.id = :storybookId AND s.finishedAt IS NOT NULL")
        Optional<Session> findByChildIdAndStorybookIdAndFinishedAtIsNotNull(Integer childId, Integer storybookId);

}
