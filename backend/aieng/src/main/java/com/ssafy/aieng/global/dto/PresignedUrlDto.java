package com.ssafy.aieng.global.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PresignedUrlDto {
    private String presignedUrl;
    private String fileUrl;
}