package com.ssafy.aieng.domain.auth.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class AuthRedisService {
    private final Map<String, String> tokenStore = new ConcurrentHashMap<>();
    private final long REFRESH_TOKEN_EXPIRATION = 14 * 24 * 60 * 60L; // 14일

    // RefreshToken 저장
    public void saveRefreshToken(String userId, String refreshToken) {
        String key = getRefreshTokenKey(userId);
        tokenStore.put(key, refreshToken);
    }

    // RefreshToken 조회
    public String getRefreshToken(String userId) {
        return tokenStore.get(getRefreshTokenKey(userId));
    }

    // RefreshToken 삭제
    public void deleteRefreshToken(String userId) {
        tokenStore.remove(getRefreshTokenKey(userId));
    }

    // RefreshToken 존재 여부 확인
    public boolean hasRefreshToken(String userId) {
        return tokenStore.containsKey(getRefreshTokenKey(userId));
    }

    private String getRefreshTokenKey(String userId) {
        return "refresh_token:" + userId;
    }
}