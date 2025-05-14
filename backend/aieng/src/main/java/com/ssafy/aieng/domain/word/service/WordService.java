package com.ssafy.aieng.domain.word.service;

import com.ssafy.aieng.domain.user.entity.User;
import com.ssafy.aieng.domain.user.repository.UserRepository;
import com.ssafy.aieng.domain.word.dto.response.WordResponse;
import com.ssafy.aieng.domain.word.entity.Word;
import com.ssafy.aieng.domain.word.repository.WordRepository;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class WordService {

   private final WordRepository wordRepository;
   private final UserRepository userRepository;

   // 단어 상세 조회
   public WordResponse getWordDetail(Integer userId, Integer wordId) {
      // 1. 사용자 인증
      User user = userRepository.findById(userId)
              .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

      // 2. 단어 조회
      Word word = wordRepository.findById(wordId)
              .orElseThrow(() -> new CustomException(ErrorCode.WORD_NOT_FOUND));

      // 3. Entity -> DTO 변환
      return WordResponse.of(word);
   }

}
