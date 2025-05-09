package com.ssafy.aieng.domain.dictionary.controller;

import com.ssafy.aieng.domain.dictionary.dto.DictionaryResponse;
import com.ssafy.aieng.domain.dictionary.dto.DictionaryDetailResponse;
import com.ssafy.aieng.domain.dictionary.service.DictionaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dictionary")
public class DictionaryController {

    private final DictionaryService dictionaryService;

    @GetMapping("/{childId}")
    public ResponseEntity<List<DictionaryResponse>> getUserDictionary(@PathVariable Integer childId) {
        List<DictionaryResponse> dictionary = dictionaryService.getUserDictionary(childId);
        return ResponseEntity.ok(dictionary);
    }

    @GetMapping("/{childId}/word/{wordId}")
    public ResponseEntity<DictionaryDetailResponse> getWordDetail(
            @PathVariable Integer childId,
            @PathVariable Integer wordId) {
        DictionaryDetailResponse detail = dictionaryService.getWordDetail(childId, wordId);
        return ResponseEntity.ok(detail);
    }
} 