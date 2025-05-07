package com.ssafy.aieng.domain.user.controller;

import com.ssafy.aieng.domain.auth.dto.TokenValidationResult;
import com.ssafy.aieng.domain.user.service.UserService;
import com.ssafy.aieng.global.common.response.ApiResponse;
import com.ssafy.aieng.global.common.util.AuthenticationUtil;
import com.ssafy.aieng.global.security.jwt.JwtTokenProvider;
import com.ssafy.aieng.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
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
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Authorization 헤더의 Bearer 토큰을 검증하고 유저 존재 여부를 반환합니다.
     *
     * @param authorizationHeader Authorization: Bearer {token}
     * @return 유효한 토큰이고 유저가 존재하면 true, 아니면 false
     */
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
                userId = userPrincipal.getId(); // ✅ 여기서 안전하게 꺼냄
            } else {
                log.warn("[Token Validation] 인증 주체가 UserPrincipal이 아님: {}", principal);
                return ApiResponse.fail("올바르지 않은 인증 정보입니다.", HttpStatus.UNAUTHORIZED);
            }

            boolean userExists = userService.existsById(userId);
            return ApiResponse.success(userExists);

        } catch (IllegalArgumentException e) {
            log.warn("[Token Validation] 잘못된 Authorization 헤더 형식: {}", authorizationHeader);
            return ApiResponse.fail("Authorization 헤더 형식이 잘못되었습니다.", HttpStatus.BAD_REQUEST);

        } catch (Exception e) {
            log.error("[Token Validation] 유저 조회 실패", e);
            return ApiResponse.fail("서버 오류로 인해 토큰을 검증할 수 없습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    /**
     * Authorization 헤더에서 Bearer 토큰 추출
     *
     * @param header Authorization 헤더
     * @return 실제 토큰 문자열
     */
    private String extractBearerToken(String header) {
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        throw new IllegalArgumentException("Authorization 헤더는 'Bearer '로 시작해야 합니다.");
    }


    /**
     * 회원 탈퇴 (Soft Delete)
     * - 실제 삭제하지 않고, deleted 플래그를 true로 설정합니다.
     * - 인증된 사용자만 접근 가능 (Spring Security가 인증 미비 시 401 처리)
     */
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        userService.deleteUser(userId);

        return ResponseEntity.noContent().build();  // 204 No Content
    }

    /**
     * 닉네임 중복확인 (회원의 닉네임 중복)
     */
    @GetMapping("/nickname-check")
    public ResponseEntity<ApiResponse<Boolean>> checkNickname(@RequestParam String nickname) {
        boolean isDuplicated = userService.checkNickname(nickname);
        return ApiResponse.success(isDuplicated);
    }



}
