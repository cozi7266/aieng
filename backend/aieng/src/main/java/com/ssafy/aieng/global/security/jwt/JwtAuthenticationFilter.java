package com.ssafy.aieng.global.security.jwt;

import com.ssafy.aieng.domain.auth.dto.TokenValidationResult;
import com.ssafy.aieng.global.common.util.TestUserMaker;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    private static final List<String> TEST_TOKENS = List.of("test", "test2", "test3", "test4", "test5");

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String token = resolveToken(request);

        try {
            if (StringUtils.hasText(token)) {
                //  테스트 계정 처리
                if (TEST_TOKENS.contains(token)) {
                    Authentication authentication = TestUserMaker.getAuthentication(token);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.debug("[JWT Filter] 테스트 토큰 인증 완료: {}", token);
                } else {
                    // 실제 토큰 검증
                    TokenValidationResult validationResult = jwtTokenProvider.validateToken(token);

                    if (validationResult.isValid()) {
                        Authentication authentication = jwtTokenProvider.getAuthentication(token);
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        log.debug("[JWT Filter] 유효한 토큰 인증 완료");
                    } else {
                        log.warn("[JWT Filter] 유효하지 않은 토큰 접근 차단");
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        return;
                    }
                }
            }
        } catch (Exception e) {
            log.error("[JWT Filter] 인증 처리 중 예외 발생", e);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 보안상 필수
            return;
        }

        // 다음 필터로 이동
        filterChain.doFilter(request, response);
    }

    // Bearer 헤더에서 순수 토큰 추출
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        return (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer "))
                ? bearerToken.substring(7)
                : null;
    }

    // Swagger 및 인증 예외 경로 설정
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/api/oauth") || path.startsWith("/swagger") || path.startsWith("/v3/api-docs");
    }
}

