package com.ssafy.aieng.domain.voice.dto.response;

import com.ssafy.aieng.domain.mood.dto.MoodResponseDto;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class SongVoiceSettingResponse {
    private List<MoodResponseDto> moods;
    private List<VoiceResponse> voices;
}