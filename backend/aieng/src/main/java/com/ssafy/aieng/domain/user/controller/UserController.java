package com.ssafy.aieng.domain.user.controller;

import com.ssafy.aieng.domain.child.dto.request.ChildProfileImgUpdateRequest;
import com.ssafy.aieng.domain.user.dto.request.UserProfileCreateRequest;
import com.ssafy.aieng.domain.user.dto.request.UserProfileUpdateRequest;
import com.ssafy.aieng.domain.user.dto.request.UserUpdateImgRequest;
import com.ssafy.aieng.domain.user.dto.response.UserProfileResponse;
import com.ssafy.aieng.domain.user.service.UserService;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.common.util.AuthenticationUtil;
import com.ssafy.aieng.global.security.jwt.JwtTokenProvider;
import com.ssafy.aieng.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final AuthenticationUtil authenticationUtil;
    private final UserService userService;

    // Authorization 헤더의 Bearer 토큰을 검증하고 유저 존재 여부를 반환합니다.  @return 유효한 토큰이고 유저가 존재하면 true, 아니면 false
    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<Boolean>> validateToken(
            @RequestHeader("Authorization") String authorizationHeader) {

        try {
            String token = extractBearerToken(authorizationHeader);

            // JwtAuthenticationFilter에서 인증 객체가 설정되었는지 확인
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("[Token Validation] 인증 정보가 존재하지 않음");
                return ApiResponse.fail("토큰이 유효하지 않거나 만료되었습니다.", HttpStatus.UNAUTHORIZED);
            }

            // 테스트 토큰이라도 authentication에 UserPrincipal이 있을 수 있음
            Object principal = authentication.getPrincipal();
            Integer userId = null;

            if (principal instanceof UserPrincipal userPrincipal) {
                userId = userPrincipal.getId();
            } else {
                return ApiResponse.fail("올바르지 않은 인증 정보입니다.", HttpStatus.UNAUTHORIZED);
            }

            boolean userExists = userService.existsById(userId);
            return ApiResponse.success(userExists);

        } catch (IllegalArgumentException e) {
            return ApiResponse.fail("Authorization 헤더 형식이 잘못되었습니다.", HttpStatus.BAD_REQUEST);

        } catch (Exception e) {
            return ApiResponse.fail("서버 오류로 인해 토큰을 검증할 수 없습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Authorization 헤더에서 Bearer 토큰 추출
    private String extractBearerToken(String header) {
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        throw new IllegalArgumentException("Authorization 헤더는 'Bearer '로 시작해야 합니다.");
    }


    // 회원 탈퇴 (Soft Delete)
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        userService.deleteUser(userId);

        return ResponseEntity.noContent().build();
    }

     // 닉네임 중복확인 (회원의 닉네임 중복)
    @GetMapping("/nickname-check")
    public ResponseEntity<ApiResponse<Boolean>> checkNickname(@RequestParam String nickname) {

        boolean isDuplicated = userService.checkNickname(nickname);
        return ApiResponse.success(isDuplicated);
    }

    // 회원(부모) 프로필 등록
    @PostMapping("/profile")
    public ResponseEntity<ApiResponse<Void>> createUserProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UserProfileCreateRequest request){

        Integer userId = userPrincipal.getId();

        userService.createUserProfile(userId, request);

        return ApiResponse.success(HttpStatus.OK);
    }

    // 회원(부모) 프로필 조회
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> findUserProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Integer userId = userPrincipal.getId();

        UserProfileResponse UserProfileResponse = userService.getParentInfo(userId);

        return ApiResponse.success(UserProfileResponse);
    }

    // 회원(부모) 프로프 수정
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Void>> updateUserProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UserProfileUpdateRequest request) {

        Integer userId = userPrincipal.getId();

        userService.updateUserProfile(userId, request);

        return ApiResponse.success(HttpStatus.OK);
    }

    // 회원(부모) 프로필 사진 등록/수정/삭제
    @PutMapping("/profile-img")
    public ResponseEntity<ApiResponse<Void>> updateUserProfileImg(
            @AuthenticationPrincipal UserPrincipal parentPrincipal,
            @RequestBody UserUpdateImgRequest request){

        Integer userId = parentPrincipal.getId();
        userService.updateUserProfileImg(userId, request);

        return ApiResponse.success(HttpStatus.OK);
    }
}
