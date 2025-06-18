package com.ssafy.aieng.domain.song.repository;

import com.ssafy.aieng.domain.song.entity.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SongRepository extends JpaRepository<Song, Integer> {


    boolean existsBySessionId(Integer sessionId);

    List<Song> findAllBySession_Child_IdOrderByCreatedAtDesc(Integer childId);

    Optional<Song> findBySessionId(Integer sessionId);
}