package com.ssafy.aieng.domain.word.dto.response;

import com.ssafy.aieng.domain.word.entity.Word;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class WordResponse {
    private Integer wordId;
    private String wordEn;
    private String wordKo;
    private String wordImgUrl;
    private String wordTtsUrl;

    public static WordResponse of(Word word) {
        return new WordResponse(
                word.getId(),
                word.getWordEn(),
                word.getWordKo(),
                word.getImgUrl(),
                word.getTtsUrl()
        );
    }
}
