package com.ssafy.aieng.domain.dictionary.service;

import com.ssafy.aieng.domain.dictionary.dto.DictionaryResponse;
import com.ssafy.aieng.domain.dictionary.dto.DictionaryDetailResponse;
import com.ssafy.aieng.domain.learning.entity.Learning;
import com.ssafy.aieng.domain.learning.repository.LearningRepository;
import com.ssafy.aieng.domain.child.repository.ChildRepository;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DictionaryService {

    private final LearningRepository learningRepository;
    private final ChildRepository childRepository;

    @Transactional(readOnly = true)
    public List<DictionaryResponse> getDictionaryByChildId(Integer childId, Integer userId) {
        log.info("[DictionaryService] Checking child access - childId: {}, userId: {}", childId, userId);
        // 1. childId가 해당 userId의 자녀인지 확인
        if (!childRepository.existsByIdAndParentId(childId, userId)) {
            log.warn("[DictionaryService] Invalid child access attempt - childId: {}, userId: {}", childId, userId);
            throw new CustomException(ErrorCode.DICTIONARY_INVALID_CHILD);
        }

        // 2. 학습한 단어 목록 조회
        List<Learning> learnings = learningRepository.findAllByChildIdAndLearnedTrueOrderByLearnedAtDesc(childId);
        log.info("[DictionaryService] Found {} learned words for childId: {}", learnings.size(), childId);
        
        if (learnings.isEmpty()) {
            log.warn("[DictionaryService] No learned words found - childId: {}", childId);
            throw new CustomException(ErrorCode.DICTIONARY_NO_LEARNED_WORDS);
        }

        return learnings.stream()
                .map(DictionaryResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DictionaryDetailResponse getDictionaryDetail(Integer childId, Integer wordId, Integer userId) {
        log.info("[DictionaryService] Checking child access for word detail - childId: {}, wordId: {}, userId: {}", 
                childId, wordId, userId);
        // 1. childId가 해당 userId의 자녀인지 확인
        if (!childRepository.existsByIdAndParentId(childId, userId)) {
            log.warn("[DictionaryService] Invalid child access attempt for word detail - childId: {}, userId: {}", 
                    childId, userId);
            throw new CustomException(ErrorCode.DICTIONARY_INVALID_CHILD);
        }

        // 2. 특정 단어의 학습 정보 조회
        Optional<Learning> learningOpt = learningRepository.findBySession_Child_IdAndWord_IdAndLearnedTrue(childId, wordId);
        log.info("[DictionaryService] Learning record found: {}", learningOpt.isPresent());
        
        if (learningOpt.isEmpty()) {
            log.warn("[DictionaryService] Word not found or not learned - childId: {}, wordId: {}", childId, wordId);
            throw new CustomException(ErrorCode.DICTIONARY_WORD_NOT_FOUND);
        }

        Learning learning = learningOpt.get();
        log.info("[DictionaryService] Found word detail - childId: {}, wordId: {}, learned: {}, learnedAt: {}", 
                childId, wordId, learning.isLearned(), learning.getLearnedAt());
        
        return DictionaryDetailResponse.from(learning);
    }
} 