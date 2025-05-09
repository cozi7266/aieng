package com.ssafy.aieng.domain.learning.controller;

import com.ssafy.aieng.domain.learning.service.LearningService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/learning")
public class LearningController {
    private final LearningService learningService;
} 