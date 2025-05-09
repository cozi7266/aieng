package com.ssafy.aieng.domain.voice.service;

import com.ssafy.aieng.domain.voice.dto.request.VoiceCreateRequest;
import com.ssafy.aieng.domain.voice.dto.response.VoiceResponse;

public interface VoiceService {
    VoiceResponse createVoice(VoiceCreateRequest request);
} 