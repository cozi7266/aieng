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

    // 특정 아이가 특정 노래를 찜했는지 LikedSong 엔티티 조회
    Optional<LikedSong> findByChildAndSong(Child child, Song song);

    // 특정 아이가 특정 노래를 찜했는지 여부 확인
    boolean existsByChildAndSong(Child child, Song song);

    // 특정 아이가 찜한 모든 노래 목록 조회
    List<LikedSong> findAllByChild(Child child);

    // childId, songId로 찜 여부 확인
    boolean existsByChildIdAndSongId(Integer childId, Integer songId);
}
