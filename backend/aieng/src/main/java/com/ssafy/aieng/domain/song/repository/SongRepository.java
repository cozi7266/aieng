package com.ssafy.aieng.domain.song.repository;

import com.ssafy.aieng.domain.song.entity.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SongRepository extends JpaRepository<Song, Integer> {

    // 특정 세션에 해당하는 노래가 존재하는지 확인
    boolean existsBySessionId(Integer sessionId);

    // 특정 아이가 생성한 모든 노래를 생성일 내림차순으로 조회
    List<Song> findAllBySession_Child_IdOrderByCreatedAtDesc(Integer childId);

    // 특정 세션에 해당하는 노래 조회
    Optional<Song> findBySessionId(Integer sessionId);
}