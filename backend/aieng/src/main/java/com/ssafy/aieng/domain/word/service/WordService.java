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
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class WordService {

   private final WordRepository wordRepository;
   private final UserRepository userRepository;

   // 단어 상세 조회
   @Transactional(readOnly = true)
   public WordResponse getWordDetail(Integer userId, Integer wordId, Integer childId) {
      // 1. 사용자 인증
      User user = userRepository.findById(userId)
              .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

      // 2. 해당 자녀가 이 사용자 소속인지 검증
      boolean ownsChild = user.getChildren().stream()
              .anyMatch(child -> child.getId().equals(childId));
      if (!ownsChild) {
         throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
      }

      // 3. 단어 조회
      Word word = wordRepository.findById(wordId)
              .orElseThrow(() -> new CustomException(ErrorCode.WORD_NOT_FOUND));

      // 4. Entity -> DTO 변환
      return WordResponse.of(word);
   }

}
