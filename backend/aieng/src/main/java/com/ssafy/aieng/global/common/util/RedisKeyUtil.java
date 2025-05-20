package com.ssafy.aieng.global.common.util;

/**
 * Redis 키를 생성하는 유틸리티 클래스입니다.
 * 키 포맷을 표준화하여 Redis 데이터 구조를 일관되게 유지합니다.
 */
public class RedisKeyUtil {

    /**
     * 학습 콘텐츠(이미지/문장 등) 생성 결과 저장용 키
     * 예: Learning:user:3:session:10:word:cat
     */
    public static String getGeneratedContentKey(Integer userId, Integer sessionId, String wordEn) {
        return String.format("Learning:user:%d:session:%d:word:%s", userId, sessionId, wordEn);
    }

    /**
     * 동요 생성 결과(가사, URL 등) 저장용 키
     * 예: Song:user:3:session:10
     */
    public static String getGeneratedSongKey(Integer userId, Integer sessionId) {
        return String.format("Song:user:%d:session:%d", userId, sessionId);
    }

    /**
     * 동요 생성 상태(REQUESTED, IN_PROGRESS 등) 저장용 키
     * 예: Song:status:session:10
     */
    public static String getSongStatusKey(Integer sessionId) {
        return String.format("Song:status:session:%d", sessionId);
    }

    // ✅ 기존 그림책 기반 키는 더 이상 사용하지 않으므로 제거됨
}
