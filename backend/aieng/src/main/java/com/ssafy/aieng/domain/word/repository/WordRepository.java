package com.ssafy.aieng.domain.word.repository;

import com.ssafy.aieng.domain.word.entity.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WordRepository extends JpaRepository<Word, Integer> {

    // 테마 따른 전체 단어 조회
    List<Word> findAllByThemeId(Integer themeId);

    // 단이 영어 뜻에 따른 조회
    Optional<Word> findByWordEn(String wordEn);
}