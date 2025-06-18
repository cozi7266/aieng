package com.ssafy.aieng.domain.learning.dto.response;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeName;
import lombok.*;

import java.io.Serializable;

@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, include = JsonTypeInfo.As.PROPERTY, property = "@class")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ThemeProgressResponse implements Serializable {
    private String themeName;
    private String imageUrl;
    private int totalWords;
    private int learnedWords;

    // Optional static factory (사용하던 경우 계속 사용 가능)
    public static ThemeProgressResponse of(String themeName, String imageUrl, int totalWords, int learnedWords) {
        return ThemeProgressResponse.builder()
                .themeName(themeName)
                .imageUrl(imageUrl)
                .totalWords(totalWords)
                .learnedWords(learnedWords)
                .build();
    }
}
