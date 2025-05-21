package com.ssafy.aieng.domain.voice.dto.request;

import lombok.Getter;

@Getter
public class PronounceTestRequest {

    private String pronounceUrl;
    private String expectedText;

}
