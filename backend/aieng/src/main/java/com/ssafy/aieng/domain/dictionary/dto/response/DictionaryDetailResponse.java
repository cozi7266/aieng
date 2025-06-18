package com.ssafy.aieng.domain.dictionary.dto.response;

import com.ssafy.aieng.domain.word.entity.Word;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DictionaryDetailResponse {

    private Integer wordId;
    private String wordKo;
    private String wordEn;
    private String imgUrl;
    private String ttsUrl;
    private boolean isLearned;

    public static DictionaryDetailResponse of(Word word, boolean isLearned) {
        return DictionaryDetailResponse.builder()
                .wordId(word.getId())
                .wordKo(word.getWordKo())
                .wordEn(word.getWordEn())
                .imgUrl(word.getImgUrl())
                .ttsUrl(word.getTtsUrl())
                .isLearned(isLearned)
                .build();
    }
}