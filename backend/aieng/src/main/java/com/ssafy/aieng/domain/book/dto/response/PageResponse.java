package com.ssafy.aieng.domain.book.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ssafy.aieng.domain.learning.entity.Learning;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PageResponse {
    private String word;
    private String image;
    private String sentence;

    public static PageResponse from(Learning learning) {
        return PageResponse.builder()
                .word(learning.getWord().getWordEn())
                .image(learning.getImgUrl())
                .sentence(learning.getSentence())
                .build();
    }
} 