package com.ssafy.aieng.domain.book.dto.response;

import com.ssafy.aieng.domain.learning.entity.Learning;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PageResponse {

    private Integer wordId;
    private String wordEn;
    private String wordKo;
    private String wordImgUrl;
    private String sentence;
    private String translation;
    private String sentenceImgUrl;
    private String sentenceTtsUrl;
    private Integer pageOrder;

    public static PageResponse from(Learning learning) {
        return PageResponse.builder()
                .wordId(learning.getWord().getId())
                .wordEn(learning.getWord().getWordEn())
                .wordKo(learning.getWord().getWordKo())
                .wordImgUrl(learning.getWord().getImgUrl())
                .sentence(learning.getSentence())
                .translation(learning.getTranslation())
                .sentenceImgUrl(learning.getImgUrl())
                .sentenceTtsUrl(learning.getTtsUrl())
                .pageOrder(learning.getPageOrder())
                .build();
    }
}
