package com.ssafy.aieng.domain.word.repository;

import com.ssafy.aieng.domain.word.entity.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WordRepository extends JpaRepository<Word, Integer> {

    List<Word> findAllByThemeId(Integer themeId);
}