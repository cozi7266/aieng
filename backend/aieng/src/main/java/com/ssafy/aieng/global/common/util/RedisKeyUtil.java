package com.ssafy.aieng.global.common.util;

public class RedisKeyUtil {

    // 예: 학습 결과 저장 키
    public static String getGeneratedContentKey(Integer userId, Integer sessionId, String word) {
        return String.format("word:%d:%d:%s", userId, sessionId, word);
    }

    // 예: 문장 조회용 캐시 키
    public static String getSentenceCacheKey(Integer sessionId, Integer wordId, String wordEn) {
        return String.format("word:%d:%d:%s", sessionId, wordId, wordEn);
    }

    // 필요시 TTL이나 prefix 정의도 추가 가능
}
