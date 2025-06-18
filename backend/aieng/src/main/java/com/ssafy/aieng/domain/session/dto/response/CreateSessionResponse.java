package com.ssafy.aieng.domain.session.dto.response;

import com.ssafy.aieng.domain.word.dto.response.WordResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class CreateSessionResponse {
    private Integer sessionId;
    private boolean isNew;
    private String themeEn;
    private String themeKo;
    private List<WordResponse> words;
}
