package com.ssafy.aieng.domain.voice.dto.request;

import lombok.Getter;

@Getter
public class VoiceSettingRequest {
    private Integer ttsVoiceId;   // 단어 TTS용 목소리
    private Integer songVoiceId;  // 동요 생성용 목소리
    private Integer moodId;       // 기본 분위기
}
