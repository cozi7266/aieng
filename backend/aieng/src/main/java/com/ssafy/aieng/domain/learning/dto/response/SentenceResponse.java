package com.ssafy.aieng.domain.learning.dto.response;

import com.ssafy.aieng.domain.learning.entity.Learning;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SentenceResponse {

    private String wordEn;
    private String wordKo;
    private String sentence;
    private String translation;
    private String sentenceImgUrl;
    private String sentenceTtsUrl;

    public static SentenceResponse of(Learning learning) {
        return new SentenceResponse(
                learning.getWord().getWordEn(),
                learning.getWord().getWordKo(),
                learning.getSentence(),
                learning.getTranslation(),
                learning.getImgUrl(),
                learning.getTtsUrl()
        );
    }
}
