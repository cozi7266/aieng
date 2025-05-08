package com.ssafy.aieng.domain.dictionary.service;

import com.ssafy.aieng.domain.dictionary.dto.DictionaryResponse;
import com.ssafy.aieng.domain.dictionary.dto.DictionaryDetailResponse;

import java.util.List;

public interface DictionaryService {
    List<DictionaryResponse> getUserDictionary(Integer childId);
    DictionaryDetailResponse getWordDetail(Integer childId, Integer wordId);
} 