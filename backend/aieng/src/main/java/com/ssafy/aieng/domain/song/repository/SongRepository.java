package com.ssafy.aieng.domain.song.repository;

import com.ssafy.aieng.domain.song.entity.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SongRepository extends JpaRepository<Song, Integer> {

    List<Song> findAllByStorybookChildIdOrderByCreatedAtDesc(Integer childId);

    boolean existsByStorybookId(Integer storybookId);

    Optional<Song> findByStorybookId(Integer storybookId);
}