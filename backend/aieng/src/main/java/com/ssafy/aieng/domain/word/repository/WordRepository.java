package com.ssafy.aieng.domain.word.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ssafy.aieng.domain.word.entity.Word;

@Repository
public interface WordRepository extends JpaRepository<Word, Integer> {

    List<Word> findAllByThemeId(Integer themeId);
}