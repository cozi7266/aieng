package com.ssafy.aieng.domain.book.repository;

import com.ssafy.aieng.domain.book.entity.Storybook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
 
@Repository
public interface StorybookRepository extends JpaRepository<Storybook, Integer> {
    // Additional query methods can be added here if needed
} 