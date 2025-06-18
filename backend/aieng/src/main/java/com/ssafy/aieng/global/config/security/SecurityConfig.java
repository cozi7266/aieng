package com.ssafy.aieng.global.config.security;

import com.ssafy.aieng.global.security.jwt.JwtAuthenticationFilter;
import com.ssafy.aieng.global.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Slf4j
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;


    @Value("${app.domain}")
    private String domain;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
//                cors 설정
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))  // prefilght(OPTIONS) 처리 목적 추가
//                CSRF 비활성화 (JWT 사용시 일반적)
                .csrf(AbstractHttpConfigurer::disable)
//                세션 설정 (JWT는 무상태성이므로 STATELESS로)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
//                요청 URL별 인증 설정
                .authorizeHttpRequests(authorize ->
                        authorize
                                // 소셜 로그인 or 토큰 검증 등 비인증 허용 경로
                                .requestMatchers(
                                        "/api/oauth/**",             // 소셜 로그인용
                                        "/api/user/validate",        // 토큰 유효성 검사용
                                        "/api/public/**",            // (필요 시 추가)
                                        "/oauth/kakao/**"
                                ).permitAll()

                                // 그 외 모든 /api/user/** 요청은 인증 필요
                                .requestMatchers("/api/user/**").authenticated()

                                // 나머지도 기본 인증 필요
                                .anyRequest().authenticated()
                )


//                JWT 인증 필터 추가
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        String localhostFront = "http://localhost:5173";

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(domain, localhostFront));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization", "Content-Type", "X-Requested-With",
                "Access-Control-Allow-Credentials", "Access-Control-Allow-Origin","Access-Control-Allow-Headers",
                "Accept", "Origin", "Cookie", "Set-Cookie",
                "Cache-Control", "Connection"
        ));
        configuration.setExposedHeaders(List.of("Set-Cookie"));  // 쿠키 노출 허용
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
