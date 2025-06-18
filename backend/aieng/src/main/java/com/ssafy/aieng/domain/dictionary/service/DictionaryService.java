package com.ssafy.aieng.domain.dictionary.service;

import com.ssafy.aieng.domain.dictionary.dto.response.DictionaryDetailResponse;
import com.ssafy.aieng.domain.dictionary.dto.response.DictionaryThemesResponse;
import com.ssafy.aieng.domain.learning.entity.Learning;
import com.ssafy.aieng.domain.learning.repository.LearningRepository;
import com.ssafy.aieng.domain.child.repository.ChildRepository;
import com.ssafy.aieng.domain.theme.entity.Theme;
import com.ssafy.aieng.domain.theme.repository.ThemeRepository;
import com.ssafy.aieng.domain.word.entity.Word;
import com.ssafy.aieng.domain.word.repository.WordRepository;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DictionaryService {

    private final LearningRepository learningRepository;
    private final ChildRepository childRepository;
    private final ThemeRepository themeRepository;
    private final WordRepository wordRepository;

    // 단어도감 내의 테마 목록 조회 (각 테마별 총 단어 수 + 학습한 단어 수 포함)
    @Transactional(readOnly = true)
    public List<DictionaryThemesResponse> getThemesWithProgress(Integer childId, Integer userId) {

        // 1. 자녀 소유 검증
        if (!childRepository.existsByIdAndUserId(childId, userId)) {
            throw new CustomException(ErrorCode.DICTIONARY_INVALID_CHILD);
        }

        // 2. 전체 테마 조회
        List<Theme> themes = themeRepository.findAll();

        // 3. 자녀가 학습한 단어 목록 조회
        List<Learning> learnings = learningRepository.findAllBySession_Child_IdAndLearnedTrue(childId);

        // 4. 테마 ID별로 학습한 단어 ID 모으기 (중복 제거됨)
        Map<Integer, Set<Integer>> themeIdToLearnedWordIds = learnings.stream()
                .collect(Collectors.groupingBy(
                        l -> l.getWord().getTheme().getId(),
                        Collectors.mapping(l -> l.getWord().getId(), Collectors.toSet())
                ));

        // 5. 응답 생성
        return themes.stream()
                .map(theme -> {
                    int totalWords = theme.getTotalWords();
                    int learnedCount = themeIdToLearnedWordIds
                            .getOrDefault(theme.getId(), Set.of())
                            .size();

                    return DictionaryThemesResponse.of(
                            theme.getId(),
                            theme.getThemeKo(),
                            theme.getThemeEn(),
                            theme.getImageUrl(),
                            totalWords,
                            learnedCount
                    );
                })
                .collect(Collectors.toList());
    }


    // 단어도감 특정 테마의 전체 단어 조회 (단어별 학습 여부 포함)
    @Transactional(readOnly = true)
    public List<DictionaryDetailResponse> getWordsByTheme(Integer childId, Integer themeId, Integer userId) {
        // 자녀 소유 검증
        if (!childRepository.existsByIdAndUserId(childId, userId)) {
            throw new CustomException(ErrorCode.DICTIONARY_INVALID_CHILD);
        }

        //  해당 테마의 단어 목록 조회
        List<Word> words = wordRepository.findAllByThemeId(themeId);

        // 자녀가 학습한 단어 ID 목록 조회
        Set<Integer> learnedWordIds = learningRepository.findAllBySession_Child_IdAndLearnedTrue(childId).stream()
                .map(learning -> learning.getWord().getId())
                .collect(Collectors.toSet());

        // 응답 생성
        return words.stream()
                .map(word -> DictionaryDetailResponse.of(word, learnedWordIds.contains(word.getId())))
                .collect(Collectors.toList());
    }
}
