package com.ssafy.aieng.global.common.util;

public class RedisKeyUtil {

    // 학습 결과 저장 키
    public static String getGeneratedContentKey(Integer userId, Integer sessionId, String wordEn) {
        return String.format("Learning:user:%d:session:%d:word:%s", userId, sessionId, wordEn);
    }

    // 문장 조회용 캐시 키
    public static String getSentenceCacheKey(Integer sessionId, Integer wordId, String wordEn) {
        return String.format("word:%d:%d:%s", sessionId, wordId, wordEn);
    }

    // 동요 생성 결과 저장 키
    public static String getGeneratedSongKey(Integer userId, Integer sessionId) {
        return String.format("Song:user:%d:session:%d", userId, sessionId);
    }

    // 동요 상태 저장용 키
    public static String getSongStatusKey(Integer sessionId) {
        return String.format("SongStatus:session:%d", sessionId);
    }


}
