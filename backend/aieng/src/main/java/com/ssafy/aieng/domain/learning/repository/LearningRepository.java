package com.ssafy.aieng.domain.learning.repository;

import java.util.List;
import java.util.Optional;

import com.ssafy.aieng.domain.learning.entity.Learning;
import com.ssafy.aieng.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LearningRepository extends JpaRepository<Learning, Integer> {

    List<Learning> findTop5ByWordThemeIdAndLearnedTrueOrderByLearnedAtDesc(Integer themeId);

    @Query("SELECT l FROM Learning l JOIN l.session s WHERE s.child.id = :childId AND l.learned = true ORDER BY l.learnedAt DESC")
    List<Learning> findAllByChildIdAndLearnedTrueOrderByLearnedAtDesc(@Param("childId") Integer childId);

    @Query("""
        SELECT l FROM Learning l
        WHERE l.session.id = :sessionId AND l.word.id = :wordId
        """)
    Optional<Learning> findBySessionIdAndWordId(@Param("sessionId") Integer sessionId,
                                                @Param("wordId") Integer wordId);

    Optional<Learning> findBySession_Child_IdAndWord_IdAndLearnedTrue(Integer childId, Integer wordId);

    @Query("""
        SELECT l
        FROM Learning l
        JOIN l.session s
        WHERE s.child.id = :childId
        AND l.word.id = :wordId
        AND l.learned = true
    """)
    Optional<Learning> findByChildIdAndWordIdAndLearnedTrue(
            @Param("childId") Integer childId,
            @Param("wordId") Integer wordId
    );

    List<Learning> findBySessionIdAndLearnedTrue(Integer sessionId);

    long countBySessionChildUserAndLearned(User user, boolean learned);

    @Query("SELECT COUNT(l) FROM Learning l WHERE l.session.id = :sessionId AND l.learned = true")
    long countBySessionIdAndLearnedTrue(@Param("sessionId") Integer sessionId);
}