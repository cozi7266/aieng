package com.ssafy.aieng.domain.user.service;


import com.ssafy.aieng.domain.auth.dto.response.UserInfoResponse;
import com.ssafy.aieng.domain.user.dto.response.ChildInfoResponse;
import com.ssafy.aieng.domain.user.dto.response.ParentInfoResponse;
import com.ssafy.aieng.domain.user.entity.Child;
import com.ssafy.aieng.domain.user.entity.User;
import com.ssafy.aieng.domain.user.repository.ChildRepository;
import com.ssafy.aieng.domain.user.repository.UserRepository;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ChildRepository childRepository;

    public Boolean existsById(Integer userId) {
        return userRepository.existsById(userId);
    }

    // 회원탈퇴 (soft delete)
    @Transactional
    public void deleteUser(Integer userId) {

        // 1. 사용자 인증
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 2. 이미 탈퇴한 사용자인지 확인
        if(user.isDeleted() || user.getDeletedAt() != null) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        user.markAsDeleted();
    }

    // 닉네임 중복
    public boolean checkNickname(String nickname) {
        return userRepository.existsByNickname(nickname);
    }

    // 부모 정보 조회
    public ParentInfoResponse getParentInfo(Integer userId) {

        // 1. 사용자 인증
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 2. DTO로 변환하여 반환
        return ParentInfoResponse.of(user);
    }

    // 아이 정보 조회
    public ChildInfoResponse getChildInfo(Integer userId, Integer childId) {
        // UserId로 해당 유저의 자녀 정보를 찾기
        User parentUser = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // userId와 childId를 기반으로 자녀 정보 조회
        Child child = childRepository.findByParentIdAndId(userId, childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));

        // 조회된 자녀 정보를 기반으로 ChildInfoResponse 반환
        return ChildInfoResponse.of(parentUser, child);
    }
}
