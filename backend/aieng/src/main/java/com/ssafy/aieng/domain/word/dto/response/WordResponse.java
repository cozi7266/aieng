package com.ssafy.aieng.domain.word.dto.response;

import com.ssafy.aieng.domain.learning.entity.Learning;
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
    private Boolean isLearned;

    // 1. Learning 객체 기반
    public static WordResponse of(Word word, Learning learning) {
        return new WordResponse(
                word.getId(),
                word.getWordEn(),
                word.getWordKo(),
                word.getImgUrl(),
                word.getTtsUrl(),
                learning.isLearned()
        );
    }

    // 2. Learning 단독 객체 기반
    public static WordResponse of(Learning learning) {
        Word word = learning.getWord();
        return new WordResponse(
                word.getId(),
                word.getWordEn(),
                word.getWordKo(),
                word.getImgUrl(),
                word.getTtsUrl(),
                learning.isLearned()
        );
    }

    // 3. Word만 있고, 학습 여부를 따로 지정하고 싶은 경우
    public static WordResponse of(Word word, boolean isLearned) {
        return new WordResponse(
                word.getId(),
                word.getWordEn(),
                word.getWordKo(),
                word.getImgUrl(),
                word.getTtsUrl(),
                isLearned
        );
    }

    // 4. Word만 있을 경우 기본값으로 학습 안됨(false)
    public static WordResponse of(Word word) {
        return of(word, false);  // 기본은 false 처리
    }
}
