package com.ssafy.aieng.global.common.util;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentSkipListMap;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagVectorService {

    // Map<UserId, Map<Tag, Score>>
    private final ConcurrentHashMap<Integer, ConcurrentHashMap<String, Double>> userTagScores = new ConcurrentHashMap<>();

    private String getUserTagVectorKey(Integer userId) {
        return "user:" + userId + ":tag_vector";
    }

    // 태그 점수 증가
    @Async
    public void increaseTagScore(Integer userId, String tag, double score) {
        userTagScores.computeIfAbsent(userId, k -> new ConcurrentHashMap<>())
                .compute(tag, (k, v) -> (v == null) ? score : v + score);
    }

    // Get all tag scores for a user
    public Set<Map.Entry<String, Double>> getUserTagScores(Integer userId) {
        return userTagScores.getOrDefault(userId, new ConcurrentHashMap<>()).entrySet();
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
