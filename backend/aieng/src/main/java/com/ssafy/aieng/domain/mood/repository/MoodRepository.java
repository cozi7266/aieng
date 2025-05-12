package com.ssafy.aieng.domain.mood.repository;

import com.ssafy.aieng.domain.mood.entity.Mood;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MoodRepository extends JpaRepository<Mood, Integer> {
} 