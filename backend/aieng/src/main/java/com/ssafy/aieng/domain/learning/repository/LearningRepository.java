package com.ssafy.aieng.domain.learning.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import com.ssafy.aieng.domain.learning.dto.response.ThemeProgressResponse;
import com.ssafy.aieng.domain.learning.entity.Learning;
import com.ssafy.aieng.domain.session.entity.Session;
import com.ssafy.aieng.domain.user.entity.User;
import com.ssafy.aieng.domain.word.entity.Word;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LearningRepository extends JpaRepository<Learning, Integer> {

    // 세션 ID와 단어 ID로 Learning 엔티티 1개 조회
    @Query("""
        SELECT l FROM Learning l
        WHERE l.session.id = :sessionId AND l.word.id = :wordId
        """)
    Optional<Learning> findBySessionIdAndWordId(@Param("sessionId") Integer sessionId,
                                                @Param("wordId") Integer wordId);


    // 세션 ID로 삭제되지 않은 Learning 목록 조회
    List<Learning> findAllBySessionIdAndDeletedFalse(Integer sessionId);

    // 세션 ID로 학습 완료(learned)된 Learning 개수 반환
    long countBySessionIdAndLearned(Integer sessionId, boolean b);

    // 세션 ID로 학습 완료된 Learning 목록 조회
    List<Learning> findAllBySessionIdAndLearnedTrue(Integer sessionId);

    // 세션 ID로 학습 완료된 Learning을 pageOrder 순으로 조회
    List<Learning> findAllBySessionIdAndLearnedTrueOrderByPageOrder(Integer sessionId);

    // 자녀 ID로 학습 완료된 Learning 전체 조회 (세션 구분 없음)
    List<Learning> findAllBySession_Child_IdAndLearnedTrue(Integer childId);

}