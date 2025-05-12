package com.ssafy.aieng.domain.learning.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.ssafy.aieng.domain.learning.entity.Learning;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor  // Redis 직렬화 시 필요
@AllArgsConstructor
@Builder
public class LearningWordResponse implements Serializable {
    private Integer learningId;
    private Integer wordId;
    private String wordEn;
    private String wordKo;
    private String imgUrl;
    private String ttsUrl;
    private boolean learned;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime learnedAt;

    public static LearningWordResponse of(Learning learning) {
        return LearningWordResponse.builder()
                .learningId(learning.getId())
                .wordId(learning.getWord().getId())
                .wordEn(learning.getWord().getWordEn())
                .wordKo(learning.getWord().getWordKo())
                .imgUrl(learning.getImgUrl())
                .ttsUrl(learning.getTtsUrl())
                .learned(learning.isLearned())
                .learnedAt(learning.getLearnedAt())
                .build();
    }
}
