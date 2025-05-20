package com.ssafy.aieng.domain.session.repository;

import com.ssafy.aieng.domain.session.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Integer> {

    // id로 삭제되지 않은 Session 조회
    Optional<Session> findByIdAndDeletedFalse(Integer id);

    // childId로 삭제되지 않은 모든 Session 조회
    List<Session> findAllByChildIdAndDeletedFalse(Integer childId);

    // childId와 themeId로 가장 최근에 시작한 삭제되지 않은 Session 조회
    Optional<Session> findTopByChildIdAndThemeIdAndDeletedFalseOrderByStartedAtDesc(Integer childId, Integer themeId);

    // childId와 themeId로 삭제되지 않은 Session을 시작 시간 기준 내림차순 조회
    @Query("SELECT s FROM Session s " +
            "WHERE s.child.id = :childId AND s.theme.id = :themeId AND s.deleted = false " +
            "ORDER BY s.startedAt DESC")
    List<Session> findSessionsByChildAndThemeOrdered(@Param("childId") Integer childId,
                                                     @Param("themeId") Integer themeId);

}
