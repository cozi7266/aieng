package com.ssafy.aieng.global.common.redis.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RedisService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper(); // ObjectMapper 필요

    public void save(String key, Object value, long ttlSeconds) {
        redisTemplate.opsForValue().set(key, value, Duration.ofSeconds(ttlSeconds));
    }

    public <T> T get(String key, Class<T> clazz) {
        Object obj = redisTemplate.opsForValue().get(key);
        return obj == null ? null : clazz.cast(obj);
    }

    public <T> List<T> getList(String key, Class<T> elementType) {
        Object obj = redisTemplate.opsForValue().get(key);
        if (obj == null) return null;

        return objectMapper.convertValue(
                obj,
                objectMapper.getTypeFactory().constructCollectionType(List.class, elementType)
        );
    }

    public void delete(String key) {
        redisTemplate.delete(key);
    }


}
