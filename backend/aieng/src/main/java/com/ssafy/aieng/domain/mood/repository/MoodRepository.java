package com.ssafy.aieng.domain.mood.repository;

import com.ssafy.aieng.domain.mood.entity.Mood;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MoodRepository extends JpaRepository<Mood, Integer> {

    Optional<Mood> findByName(String moodName);
}