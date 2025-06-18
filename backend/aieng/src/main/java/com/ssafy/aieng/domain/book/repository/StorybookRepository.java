
package com.ssafy.aieng.domain.book.repository;
import com.ssafy.aieng.domain.book.entity.Storybook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface StorybookRepository extends JpaRepository<Storybook, Integer> {

    // 자녀 ID로 삭제되지 않은 그림책을 생성일 기준 내림차순 조회
    List<Storybook> findAllByChildIdAndDeletedFalseOrderByCreatedAtDesc(Integer childId);

    // 세션 ID로 연결된 LearningStorybook이 존재하는지 여부 반환
    @Query("SELECT CASE WHEN COUNT(ls) > 0 THEN true ELSE false END " +
            "FROM LearningStorybook ls " +
            "WHERE ls.learning.session.id = :sessionId")
    boolean existsStorybookBySessionId(@Param("sessionId") Integer sessionId);

    // 세션 ID로 그림책(Storybook) 조회
    Optional<Storybook> findBySessionId(Integer id);
}