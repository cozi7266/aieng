package com.ssafy.aieng.domain.learning.repository;

import com.ssafy.aieng.domain.learning.entity.Learning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningRepository extends JpaRepository<Learning, Integer> {
    List<Learning> findTop5ByWordThemeIdAndLearnedTrueOrderByLearnedAtDesc(Integer themeId);
    
    // 테마별 모든 학습 기록 조회 (디버깅용)
    List<Learning> findAllByWordThemeId(Integer themeId);
} 