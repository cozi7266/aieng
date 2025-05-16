package com.ssafy.aieng.domain.dictionary.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.ssafy.aieng.domain.learning.entity.Learning;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class DictionaryResponse {
    private String wordEn;
    private String wordKo;
    private String imgUrl;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime learnedAt;
    private String themeEn;
    private String themeKo;

    public static DictionaryResponse from(Learning learning) {
        return DictionaryResponse.builder()
                .wordEn(learning.getWord().getWordEn())
                .wordKo(learning.getWord().getWordKo())
                .imgUrl(learning.getWord().getImgUrl())
                .learnedAt(learning.getLearnedAt())
                .themeEn(learning.getWord().getTheme().getThemeEn())
                .themeKo(learning.getWord().getTheme().getThemeKo())
                .build();
    }
}
