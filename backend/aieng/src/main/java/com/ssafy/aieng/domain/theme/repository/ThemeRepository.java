package com.ssafy.aieng.domain.theme.repository;

import com.ssafy.aieng.domain.theme.entity.Theme;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ThemeRepository extends JpaRepository<Theme, Integer > {

    // 삭제되지 않은 테마만 조회
    List<Theme> findAllByDeletedFalse();
}