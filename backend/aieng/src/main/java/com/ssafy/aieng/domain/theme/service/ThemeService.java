package com.ssafy.aieng.domain.theme.service;

import com.ssafy.aieng.domain.theme.dto.response.ThemeResponse;
import com.ssafy.aieng.domain.theme.repository.ThemeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ThemeService {

    private final ThemeRepository themeRepository;

    // 삭제되지 않은 테마만 가져오기
    public List<ThemeResponse> getThemes() {
        return themeRepository.findAllByDeletedFalse().stream()
                .map(ThemeResponse::from)  // DTO로 변환
                .toList();
    }
}
