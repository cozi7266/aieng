package com.ssafy.aieng.domain.learning.repository;

import com.ssafy.aieng.domain.learning.entity.Learning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearningRepository extends JpaRepository<Learning, Integer> {
    List<Learning> findTop5ByWordThemeIdAndLearnedTrueOrderByLearnedAtDesc(Integer themeId);
    
    // 테마별 모든 학습 기록 조회 (디버깅용)
    List<Learning> findAllByWordThemeId(Integer themeId);

    @Query("SELECT l FROM Learning l " +
           "JOIN l.session s " +
           "JOIN l.word w " +
           "WHERE s.childId = :childId " +
           "AND l.learned = true " +
           "ORDER BY l.learnedAt ASC")
    List<Learning> findAllLearnedWordsByChildId(@Param("childId") Integer childId);

    @Query("SELECT l FROM Learning l " +
           "JOIN l.session s " +
           "JOIN l.word w " +
           "WHERE s.childId = :childId " +
           "AND w.id = :wordId " +
           "AND l.learned = true " +
           "ORDER BY l.learnedAt DESC")
    Optional<Learning> findLearnedWordByChildIdAndWordId(
            @Param("childId") Integer childId,
            @Param("wordId") Integer wordId);
} 