package com.ssafy.aieng.domain.learning.dto.response;

import com.ssafy.aieng.domain.session.entity.Session;
import com.ssafy.aieng.domain.learning.entity.Learning;
import com.ssafy.aieng.domain.word.dto.response.WordResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Comparator;
import java.util.List;

@Getter
@AllArgsConstructor
public class LearningSessionDetailResponse {
    private Integer sessionId;
    private List<WordResponse> words;

    public static LearningSessionDetailResponse of(Session session, List<Learning> learnings) {
        List<WordResponse> wordResponses = learnings.stream()
                .sorted(Comparator.comparing(Learning::getPageOrder))
                .map(WordResponse::of)
                .toList();

        return new LearningSessionDetailResponse(
                session.getId(),
                wordResponses
        );
    }
}