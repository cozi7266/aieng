package com.ssafy.aieng.domain.voice.repository;

import com.ssafy.aieng.domain.voice.entity.Voice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoiceRepository extends JpaRepository<Voice, Integer> {

    // 특정 자녀와 연결된 목소리들을 조회
    List<Voice> findByChildId(Integer childId);

    // 기본(default) 목소리 목록 조회
    @Query("SELECT v FROM Voice v WHERE v.childId IS NULL ORDER BY v.createdAt DESC")
    List<Voice> findDefaultVoices();
} 