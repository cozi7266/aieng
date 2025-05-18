package com.ssafy.aieng.domain.book.dto.response;

import com.ssafy.aieng.domain.book.entity.Storybook;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StorybookListResponse {
    private Integer storybookId;
    private String title;
    private String description;
    private String coverUrl;
    private String createdAt;

    public static StorybookListResponse from(Storybook storybook) {
        return StorybookListResponse.builder()
                .storybookId(storybook.getId())
                .title(storybook.getTitle())
                .description(storybook.getDescription())
                .coverUrl(storybook.getCoverUrl())
                .createdAt(storybook.getCreatedAt().toString())
                .build();
    }
}