package com.ssafy.aieng.domain.dictionary.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.ssafy.aieng.domain.learning.entity.Learning;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class DictionaryDetailResponse {
    private String wordEn;
    private String wordKo;
    private String imgUrl;
    private String ttsUrl;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime learnedAt;
    private String themeName;
    private String sentence;  // 학습할 때 사용한 예문도 포함

    public static DictionaryDetailResponse from(Learning learning) {
        return DictionaryDetailResponse.builder()
                .wordEn(learning.getWord().getWordEn())
                .wordKo(learning.getWord().getWordKo())
                .imgUrl(learning.getWord().getImgUrl())
                .ttsUrl(learning.getWord().getTtsUrl())
                .learnedAt(learning.getLearnedAt())
                .themeName(learning.getWord().getTheme().getThemeName())
                .sentence(learning.getSentence())
                .build();
    }
}
