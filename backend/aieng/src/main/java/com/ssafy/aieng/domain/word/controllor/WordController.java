package com.ssafy.aieng.domain.word.controllor;

import com.ssafy.aieng.domain.word.dto.response.WordResponse;
import com.ssafy.aieng.domain.word.service.WordService;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/words")
@RequiredArgsConstructor
public class WordController {

    private final WordService wordService;

    @GetMapping("/{wordId}")
    public ResponseEntity<ApiResponse<WordResponse>> findWordById(
            @PathVariable("wordId") Integer wordId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Integer userId = userPrincipal.getId();
        WordResponse response = wordService.getWordDetail(userId, wordId);
        return ApiResponse.success(response);
    }

}
