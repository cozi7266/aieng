package com.ssafy.aieng.domain.book.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import java.util.List;

@Getter
public class StorybookCreateRequest {
    @JsonProperty("user_id")
    private String userId;
    
    @JsonProperty("completed_words")
    private List<String> completedWords;

    @JsonProperty("child_id")
    private Integer childId;
    
    private String title;
    
    private String description;
} 