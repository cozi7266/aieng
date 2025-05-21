package com.ssafy.aieng.domain.voice.dto.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class PronounceTestResponse {

    private String recognizedText;
    private String expectedText;
    private Integer accuracy;
    private Integer confidence;
    private String feedback;

    public static PronounceTestResponse of(
            String recognizedText,
            String expectedText,
            Integer accuracy,
            Integer confidence,
            String feedback
    ) {
        return new PronounceTestResponse(recognizedText, expectedText, accuracy, confidence, feedback);
    }
}
