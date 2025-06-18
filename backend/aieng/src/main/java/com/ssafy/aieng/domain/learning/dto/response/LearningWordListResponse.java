package com.ssafy.aieng.domain.learning.dto.response;

import lombok.*;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningWordListResponse implements Serializable {
    private Integer sessionId;
    private List<LearningWordResponse> words;
}
