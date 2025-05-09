package com.ssafy.aieng.domain.child.service;

import com.ssafy.aieng.domain.child.dto.request.ChildProfileCreateRequest;
import com.ssafy.aieng.domain.child.dto.request.ChildProfileUpdateRequest;
import com.ssafy.aieng.domain.child.dto.response.ChildInfoResponse;
import com.ssafy.aieng.domain.child.entity.Child;
import com.ssafy.aieng.domain.child.repository.ChildRepository;
import com.ssafy.aieng.domain.user.entity.User;
import com.ssafy.aieng.domain.user.repository.UserRepository;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChildService {

    private final UserRepository userRepository;
    private final ChildRepository childRepository;

    // 아이 프로필 생성
    @Transactional
    public void createChildProfile(Integer parentId, ChildProfileCreateRequest request) {

        // 1. 부모 유저 조회
        User parentUser = userRepository.findById(parentId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 2. 자녀 프로필 생성 및 저장
        Child child = Child.builder()
                .name(request.getChildName())
                .gender(request.getChildGender())
                .birthdate(request.getChildBirthdate())
                .imgUrl(request.getChildImgUrl())
                .parent(parentUser)
                .build();

        childRepository.save(child);
    }


    // 아이 프로필 조회
    public ChildInfoResponse getChildInfo(Integer parentId, Integer childId) {

        // 1. 자녀 조회 (부모 ID 포함 조건)
        Child child = childRepository.findByParentIdAndId(parentId, childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));

        // 2. 응답 객체로 변환
        return ChildInfoResponse.of(child.getParent(), child);
    }

    // 아이 프로필 수정
    @Transactional
    public void updateChildProfile(Integer parentId, Integer childId, ChildProfileUpdateRequest request) {

        // 1. 자녀 조회
        Child child = childRepository.findByParentIdAndId(parentId, childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));

        // 2. 기존 엔티티 수정 (dirty checking)
        child.updateChildProfile(
                request.getChildName(),
                request.getChildGender(),
                request.getChildBirthdate(),
                request.getChildImgUrl()
        );
    }


    // 아이 프로필 삭제 (Soft Delete)
    @Transactional
    public void deleteChildProfile(Integer parentId, Integer childId) {

        // 1. 자녀 조회
        Child child = childRepository.findByParentIdAndId(parentId, childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));

        // 2. Soft delete 처리
        child.deleteChildProfile();
    }

    // 아이 프로필 이미지 등록, 수정, 삭제 (아이 등록 후에 사용하는 기능)
    public void updateChildProfileImg(Integer parentId, Integer childId) {

        // 1. 자녀 조회
        Child child = childRepository.findByParentIdAndId(parentId, childId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHILD_NOT_FOUND));
    }
}
