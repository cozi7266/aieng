package com.ssafy.aieng.domain.voice.repository;

import com.ssafy.aieng.domain.voice.entity.Voice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoiceRepository extends JpaRepository<Voice, Integer> {
    List<Voice> findAllByChildIdOrderByCreatedAtDesc(Integer childId);
    List<Voice> findAllByChildIdIsNullOrderByCreatedAtDesc();
} 