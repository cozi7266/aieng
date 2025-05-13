package com.ssafy.aieng.domain.song.repository;

import com.ssafy.aieng.domain.song.entity.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SongRepository extends JpaRepository<Song, Integer> {
    List<Song> findByStorybookId(Integer storybookId);
    List<Song> findByVoiceId(Integer voiceId);
    List<Song> findByMoodId(Integer moodId);
    List<Song> findAllByDeletedFalse();
} 