package com.ssafy.aieng.domain.user.service;


import com.ssafy.aieng.domain.child.entity.Child;
import com.ssafy.aieng.domain.user.dto.request.UserProfileCreateRequest;
import com.ssafy.aieng.domain.user.dto.request.UserProfileUpdateRequest;
import com.ssafy.aieng.domain.user.dto.request.UserUpdateImgRequest;
import com.ssafy.aieng.domain.user.dto.response.UserProfileResponse;
import com.ssafy.aieng.domain.user.entity.User;
import com.ssafy.aieng.domain.child.repository.ChildRepository;
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

    private static final String DEFAULT_IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Sample_User_Icon.png/480px-Sample_User_Icon.png";

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
        if (user.getDeleted() || user.getDeletedAt() != null) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // 3. soft delete 수행
        user.softDelete();
    }

    // 닉네임 중복
    public boolean checkNickname(String nickname) {
        return userRepository.existsByNickname(nickname);
    }

    // 부모 정보 조회
    public UserProfileResponse getParentInfo(Integer userId) {

        // 1. 사용자 인증
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 2. DTO로 변환하여 반환
        return UserProfileResponse.of(user);
    }

    // 유저 프로필 등록
    public void createUserProfile(Integer userId, UserProfileCreateRequest request) {

        // 1. 사용자 인증
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 2. 이미지 URL 결정 (등록 안하면 디폴트 이미지 등록됨)
        String imageUrl = (request.getUserImgUrl() == null || request.getUserImgUrl().isBlank())
                ? DEFAULT_IMAGE_URL
                : request.getUserImgUrl();

        // 3. 닉네임 & 프로필 이미지 등록
        user.setNickname(request.getUserNickname());
        user.setProfileImage(imageUrl);

        userRepository.save(user);
    }

    // 유저 프로필 수정
    @Transactional
    public void updateUserProfile(Integer userId, UserProfileUpdateRequest request) {

        // 1. 유저 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 2. 닉네임 업데이트 (null이나 빈 값이 아니면)
        if (request.getUserNickname() != null && !request.getUserNickname().isBlank()) {
            user.setNickname(request.getUserNickname());
        }

        // 3. 이미지 업데이트
        String imgUrl = request.getUserImgUrl();
        if (imgUrl == null || imgUrl.isBlank()) {
            // 이미지를 삭제한 경우 → 기본 이미지로 변경
            user.setProfileImage(DEFAULT_IMAGE_URL);
        } else {
            // 수정 또는 등록
            user.setProfileImage(imgUrl);
        }

        // 4. 저장
        userRepository.save(user);
    }

    // 회원 프로필 이미지 등록, 수정, 삭제 (따로 만든 이유: 이미지 사진 클릭으로만 이미지 수정할 수 있게 하려고)
    @Transactional
    public void updateUserProfileImg(Integer userId, UserUpdateImgRequest request) {

        // 1.  유저 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        String currentImg = user.getImgUrl();
        String newImg = request.getUserImgUrl();


        // 2. null 처리 방지 && 삭제시(null or "") 디폴트 이미지 다시 저장
        if (newImg == null || newImg.isBlank()) {
            newImg = DEFAULT_IMAGE_URL;
        }

        // 3. 변경이 필요한 경우만 업데이트
        if (!newImg.equals(currentImg)) {
            user.setProfileImage(newImg);
            userRepository.save(user);
        }

    }
}
