package com.ssafy.aieng.domain.voice.dto.response;


import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class TtsVoiceSettingResponse {
    private List<VoiceResponse> defaultVoices;
    private List<VoiceResponse> customVoices;

    public static TtsVoiceSettingResponse of(List<VoiceResponse> defaultVoices, List<VoiceResponse> customVoices) {
        return new TtsVoiceSettingResponse(defaultVoices, customVoices);
    }
}