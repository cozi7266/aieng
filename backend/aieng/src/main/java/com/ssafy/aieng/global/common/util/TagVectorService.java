package com.ssafy.aieng.global.common.util;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class TagVectorService {

    private final RedisTemplate<String, String> redisTemplate;

    private String getUserTagVectorKey(Integer userId) {
        return "user:" + userId + ":tag_vector";
    }

    // 태그 점수 증가
    @Async
    public void increaseTagScore(Integer userId, String tag, double score) {
        String key = getUserTagVectorKey(userId);
        redisTemplate.opsForZSet().incrementScore(key, tag, score);
    }

    public double getScoreWeight(double score) {
        if (score == 5.0) return 0.50;
        if (score == 4.5) return 0.45;
        if (score == 4.0) return 0.30;
        if (score == 3.5) return 0.20;
        if (score == 3.0) return 0.10;
        if (score == 2.5) return 0.0;
        if (score == 2.0) return -0.15;
        if (score == 1.5) return -0.20;
        if (score == 1.0) return -0.25;
        if (score == 0.5) return -0.45;
        return 0.0; // 혹시 모를 예외 처리
    }

}
