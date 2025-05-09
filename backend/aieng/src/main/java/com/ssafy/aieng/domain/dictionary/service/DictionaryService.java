package com.ssafy.aieng.domain.dictionary.service;

import com.ssafy.aieng.domain.dictionary.dto.DictionaryResponse;
import com.ssafy.aieng.domain.dictionary.dto.DictionaryDetailResponse;
import com.ssafy.aieng.domain.learning.entity.Learning;
import com.ssafy.aieng.domain.learning.repository.LearningRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DictionaryService {

    private final LearningRepository learningRepository;

    @Transactional(readOnly = true)
    public List<DictionaryResponse> getUserDictionary(Integer childId) {
        List<Learning> learnings = learningRepository.findAllLearnedWordsByChildId(childId);
        return learnings.stream()
                .map(DictionaryResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DictionaryDetailResponse getWordDetail(Integer childId, Integer wordId) {
        Learning learning = learningRepository.findLearnedWordByChildIdAndWordId(childId, wordId)
                .orElseThrow(() -> new EntityNotFoundException("학습한 단어를 찾을 수 없습니다."));
        return DictionaryDetailResponse.from(learning);
    }
} 