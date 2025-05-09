package com.ssafy.aieng.domain.book.service;

import com.ssafy.aieng.domain.book.dto.request.StorybookCreateRequest;
import com.ssafy.aieng.domain.book.dto.response.StorybookResponse;
 
public interface StorybookService {
    StorybookResponse createStorybook(String themeId, StorybookCreateRequest request);
} 