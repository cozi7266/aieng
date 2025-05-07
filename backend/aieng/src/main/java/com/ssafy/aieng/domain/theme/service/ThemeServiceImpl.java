package com.ssafy.aieng.domain.theme.service;

import com.ssafy.aieng.domain.theme.dto.response.ThemeResponse;
import com.ssafy.aieng.domain.theme.entity.Theme;
import com.ssafy.aieng.domain.theme.repository.ThemeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ThemeServiceImpl implements ThemeService {

    private final ThemeRepository themeRepository;

    @Override
    public List<ThemeResponse> getAllThemes() {
        return themeRepository.findAll().stream()
                .map(theme -> ThemeResponse.of(
                        theme.getThemeId(),
                        theme.getName(),
                        theme.getImageUrl(),
                        theme.getCompletedWords(),
                        theme.getTotalWords()))
                .collect(Collectors.toList());
    }
} 