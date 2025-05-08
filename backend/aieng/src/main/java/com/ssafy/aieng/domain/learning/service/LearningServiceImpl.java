package com.ssafy.aieng.domain.learning.service;

import com.ssafy.aieng.domain.learning.repository.LearningRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LearningServiceImpl implements LearningService {
    private final LearningRepository learningRepository;
} 