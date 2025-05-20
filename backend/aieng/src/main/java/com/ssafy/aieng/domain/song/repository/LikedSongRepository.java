package com.ssafy.aieng.domain.song.repository;

import com.ssafy.aieng.domain.child.entity.Child;
import com.ssafy.aieng.domain.song.entity.LikedSong;
import com.ssafy.aieng.domain.song.entity.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikedSongRepository extends JpaRepository<LikedSong, Integer> {

    Optional<LikedSong> findByChildAndSong(Child child, Song song);

    boolean existsByChildAndSong(Child child, Song song);

    List<LikedSong> findAllByChild(Child child);

    boolean existsByChildIdAndSongId(Integer childId, Integer songId);
}
