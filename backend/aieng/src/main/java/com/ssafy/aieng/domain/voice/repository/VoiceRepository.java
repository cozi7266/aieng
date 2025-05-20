package com.ssafy.aieng.domain.voice.repository;

import com.ssafy.aieng.domain.voice.entity.Voice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoiceRepository extends JpaRepository<Voice, Integer> {

    List<Voice> findAllByChildIdOrderByCreatedAtDesc(Integer childId);

    List<Voice> findAllByChildIdIsNullOrderByCreatedAtDesc();

    Optional<Voice> findByName(String voiceName);

    List<Voice> findByChildId(Integer childId);
} 