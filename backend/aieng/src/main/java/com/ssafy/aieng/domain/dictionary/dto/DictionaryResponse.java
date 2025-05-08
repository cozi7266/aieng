package com.ssafy.aieng.domain.dictionary.dto;

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
    private LocalDateTime learnedAt;
    private String themeName;

    public static DictionaryResponse from(Learning learning) {
        return DictionaryResponse.builder()
                .wordEn(learning.getWord().getWordEn())
                .wordKo(learning.getWord().getWordKo())
                .imgUrl(learning.getWord().getImgUrl())
                .learnedAt(learning.getLearnedAt())
                .themeName(learning.getWord().getTheme().getThemeName())
                .build();
    }
} 