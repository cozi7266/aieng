package com.ssafy.aieng.domain.book.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ssafy.aieng.domain.book.entity.LearningStorybook;
import com.ssafy.aieng.domain.book.entity.Storybook;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Comparator;

@Getter
@Builder
public class StorybookResponse {

    @JsonProperty("storybook_id")
    private Integer storybookId;

    @JsonProperty("cover_url")
    private String coverUrl;

    private String title;
    private String description;

    private List<PageResponse> pages;

    public static StorybookResponse from(Storybook storybook) {
        List<PageResponse> pageResponses = storybook.getLearningStorybooks().stream()
                .sorted(Comparator.comparing(LearningStorybook::getPageOrder))
                .map(ls -> PageResponse.from(ls.getLearning()))
                .collect(Collectors.toList());

        return StorybookResponse.builder()
                .storybookId(storybook.getId())
                .coverUrl(storybook.getCoverUrl())
                .title(storybook.getTitle())
                .description(storybook.getDescription())
                .pages(pageResponses)
                .build();
    }
}
