package com.ssafy.aieng.domain.mood.service;

import com.ssafy.aieng.domain.mood.dto.MoodResponseDto;
import com.ssafy.aieng.domain.mood.repository.MoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MoodService {

    private final MoodRepository moodRepository;

    public List<MoodResponseDto> getAllMoods() {
        return moodRepository.findAll().stream()
                .map(MoodResponseDto::from)
                .collect(Collectors.toList());
    }
} 