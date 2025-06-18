package com.ssafy.aieng.domain.learning.repository;

import com.ssafy.aieng.domain.learning.dto.response.ThemeProgressResponse;
import com.ssafy.aieng.domain.learning.entity.Learning;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;


import java.util.List;

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
}