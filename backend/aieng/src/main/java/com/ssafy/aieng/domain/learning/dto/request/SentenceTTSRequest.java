package com.ssafy.aieng.domain.learning.dto.request;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@NoArgsConstructor  // 기본 생성자
@AllArgsConstructor // 모든 필드를 포함하는 생성자
public class SentenceTTSRequest {
    private Integer childId;
    private Integer wordId;
    private String sentence;

    // 기본 생성자가 필요하다면 추가
    // public SentenceTTSRequest() {}
}