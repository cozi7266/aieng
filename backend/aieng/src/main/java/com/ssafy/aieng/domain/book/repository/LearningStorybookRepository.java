package com.ssafy.aieng.domain.book.repository;

import com.ssafy.aieng.domain.book.entity.LearningStorybook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningStorybookRepository extends JpaRepository<LearningStorybook, Integer> {
    List<LearningStorybook> findByStorybookIdOrderByOrder(Integer storybookId);
} 