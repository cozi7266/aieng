package com.ssafy.aieng.domain.theme.repository;

import com.ssafy.aieng.domain.theme.entity.Theme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ThemeRepository extends JpaRepository<Theme, Long> {
    // JpaRepository의 findAll() 메소드를 사용하여 테마 목록 조회
}