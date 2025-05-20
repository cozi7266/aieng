
package com.ssafy.aieng.domain.book.repository;
import com.ssafy.aieng.domain.book.entity.Storybook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface StorybookRepository extends JpaRepository<Storybook, Integer> {

    List<Storybook> findAllByChildIdAndDeletedFalseOrderByCreatedAtDesc(Integer childId);

    @Query("SELECT CASE WHEN COUNT(ls) > 0 THEN true ELSE false END " +
            "FROM LearningStorybook ls " +
            "WHERE ls.learning.session.id = :sessionId")
    boolean existsStorybookBySessionId(@Param("sessionId") Integer sessionId);

}