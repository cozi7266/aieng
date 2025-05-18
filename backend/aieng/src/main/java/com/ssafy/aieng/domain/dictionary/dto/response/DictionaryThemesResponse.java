package com.ssafy.aieng.domain.dictionary.dto.response;


import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DictionaryThemesResponse {

    private Integer themeId;
    private String themeKo;
    private String themeEn;
    private String imageUrl;
    private Integer totalWords;
    private Integer learnedWords;

    public static DictionaryThemesResponse of(
            Integer themeId,
            String themeKo,
            String themeEn,
            String imageUrl,
            Integer totalWords,
            Integer learnedWords
    ) {
        return DictionaryThemesResponse.builder()
                .themeId(themeId)
                .themeKo(themeKo)
                .themeEn(themeEn)
                .imageUrl(imageUrl)
                .totalWords(totalWords)
                .learnedWords(learnedWords)
                .build();
    }
}
