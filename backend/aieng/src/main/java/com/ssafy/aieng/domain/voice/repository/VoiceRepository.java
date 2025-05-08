package com.ssafy.aieng.domain.voice.repository;

import com.ssafy.aieng.domain.voice.entity.Voice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VoiceRepository extends JpaRepository<Voice, Integer> {
} 