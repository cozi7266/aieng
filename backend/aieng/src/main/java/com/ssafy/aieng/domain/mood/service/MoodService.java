package com.ssafy.aieng.domain.mood.service;

import com.ssafy.aieng.domain.child.repository.ChildRepository;
import com.ssafy.aieng.domain.mood.dto.MoodResponseDto;
import com.ssafy.aieng.domain.mood.entity.Mood;
import com.ssafy.aieng.domain.mood.repository.MoodRepository;
import com.ssafy.aieng.global.common.util.AuthenticationUtil;
import com.ssafy.aieng.global.error.exception.CustomException;
import com.ssafy.aieng.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MoodService {

    private final MoodRepository moodRepository;
    private final ChildRepository childRepository;
    private final AuthenticationUtil authenticationUtil;

    // 전체 Mood 조회
    public List<MoodResponseDto> getAllMoods(Integer userId, Integer childId) {
        authenticationUtil.validateChildOwnership(userId, childId);

        return moodRepository.findAll().stream()
                .map(MoodResponseDto::from)
                .toList();
    }

    // 단건 Mood 조회
    public MoodResponseDto getMood(Integer userId, Integer childId, Integer moodId) {
        authenticationUtil.validateChildOwnership(userId, childId);

        Mood mood = moodRepository.findById(moodId)
                .orElseThrow(() -> new CustomException(ErrorCode.MOOD_NOT_FOUND));

        return MoodResponseDto.from(mood);
    }
}
