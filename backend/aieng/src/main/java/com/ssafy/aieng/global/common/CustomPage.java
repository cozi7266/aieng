package com.ssafy.aieng.global.common;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.io.Serializable;
import java.util.List;

@Getter
@NoArgsConstructor // Jackson 역직렬화를 위해 필수
public class CustomPage<T> implements Serializable {
    private static final long serialVersionUID = 1L;

    private List<T> content;
    private int pageNumber;
    private int totalPages;
    private long totalElements;
    private int pageSize;
    private boolean first;
    private boolean last;

    // Page 객체에서 변환용 생성자
    public CustomPage(Page<T> page) {
        this.content = page.getContent();
        this.pageNumber = page.getNumber() + 1;
        this.totalPages = page.getTotalPages();
        this.totalElements = page.getTotalElements();
        this.pageSize = page.getSize();
        this.first = page.isFirst();
        this.last = page.isLast();
    }

    // 역직렬화를 위한 생성자 (선택사항: Jackson이 잘 인식 못할 경우 대비)
    @JsonCreator
    public CustomPage(
            @JsonProperty("content") List<T> content,
            @JsonProperty("pageNumber") int pageNumber,
            @JsonProperty("totalPages") int totalPages,
            @JsonProperty("totalElements") long totalElements,
            @JsonProperty("pageSize") int pageSize,
            @JsonProperty("first") boolean first,
            @JsonProperty("last") boolean last
    ) {
        this.content = content;
        this.pageNumber = pageNumber;
        this.totalPages = totalPages;
        this.totalElements = totalElements;
        this.pageSize = pageSize;
        this.first = first;
        this.last = last;
    }
}
