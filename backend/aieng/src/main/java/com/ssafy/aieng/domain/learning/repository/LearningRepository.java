package com.ssafy.aieng.domain.learning.repository;

import com.ssafy.aieng.domain.learning.dto.response.ThemeProgressResponse;
import com.ssafy.aieng.domain.learning.entity.Learning;
import com.ssafy.aieng.domain.learning.entity.Session;
import com.ssafy.aieng.domain.word.entity.Word;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearningRepository extends JpaRepository<Learning, Integer> {

    List<Learning> findTop5ByWordThemeIdAndLearnedTrueOrderByLearnedAtDesc(Integer themeId);

    @Query("""
    SELECT new com.ssafy.aieng.domain.learning.dto.response.ThemeProgressResponse(
        t.themeName,
        t.imageUrl,
        t.totalWords,
        CAST(COUNT(DISTINCT CASE WHEN l.learned = true THEN l.word.id END) AS int)
    )
    FROM Learning l
    JOIN l.session s
    JOIN s.theme t
    WHERE s.child.id = :childId
    GROUP BY t.id, t.themeName, t.imageUrl, t.totalWords
""")
    Page<ThemeProgressResponse> findThemeProgressByChildId(@Param("childId") Integer childId, Pageable pageable);

    Page<Learning> findAllBySessionId(Integer id, Pageable pageable);

    @Query("SELECT l FROM Learning l JOIN l.session s WHERE s.child.id = :childId AND l.learned = true ORDER BY l.learnedAt DESC")
    List<Learning> findAllByChildIdAndLearnedTrueOrderByLearnedAtDesc(@Param("childId") Integer childId);

    Optional<Learning> findBySessionAndWord(Session session, Word word);

    @Query("""
        SELECT l FROM Learning l
        WHERE l.session.id = :sessionId AND l.word.id = :wordId
        """)
    Optional<Learning> findBySessionIdAndWordId(@Param("sessionId") Integer sessionId,
                                                @Param("wordId") Integer wordId);


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
}