package com.ssafy.aieng.domain.auth.service;

import com.ssafy.aieng.domain.auth.dto.LoginResult;
import com.ssafy.aieng.domain.auth.dto.OAuthUserInfo;
import com.ssafy.aieng.domain.auth.dto.TokenValidationResult;
import com.ssafy.aieng.domain.auth.dto.response.OAuthLoginResponse;
import com.ssafy.aieng.domain.auth.dto.response.TokenRefreshResponse;
import com.ssafy.aieng.domain.auth.dto.response.UserInfoResponse;
import com.ssafy.aieng.domain.auth.service.strategy.NaverOAuthStrategy;
import com.ssafy.aieng.domain.auth.service.strategy.OAuthStrategy;
import com.ssafy.aieng.domain.user.entity.User;
import com.ssafy.aieng.domain.user.enums.Provider;
import com.ssafy.aieng.domain.user.repository.UserRepository;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import com.ssafy.aieng.global.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class OAuthService {

    private final Map<Provider, OAuthStrategy> oAuthStrategyMap;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthRedisService authRedisService;

    public LoginResult handleOAuthLogin(Provider provider, String code) {
        OAuthStrategy strategy = oAuthStrategyMap.get(provider);
        if (strategy == null) {
            log.error("❌ 잘못된 OAuth Provider: {}", provider);
            throw new CustomException(ErrorCode.INVALID_OAUTH_PROVIDER);
        }

        try {
            OAuthUserInfo userInfo = strategy.getUserInfo(code);
            log.info("✅ OAuth 사용자 정보 수신: id={}, email={}", userInfo.getId(), userInfo.getEmail());

            User user = findOrCreateUser(provider, userInfo);
            String userId = user.getId().toString();

            String accessToken = jwtTokenProvider.createAccessToken(userId);
            String refreshToken = jwtTokenProvider.createRefreshToken(userId);

            authRedisService.saveRefreshToken(userId, refreshToken);

            return LoginResult.of(
                    OAuthLoginResponse.of(accessToken, UserInfoResponse.of(user)),
                    refreshToken
            );
        } catch (Exception e) {
            log.error("[{}] {} - {}", ErrorCode.OAUTH_SERVER_ERROR.name(),
                    ErrorCode.OAUTH_SERVER_ERROR.getMessage(), e.getMessage(), e);
            throw new CustomException(ErrorCode.OAUTH_SERVER_ERROR);
        }
    }

    private User findOrCreateUser(Provider provider, OAuthUserInfo userInfo) {
        return userRepository.findByProviderAndProviderIdAndDeletedAtIsNull(provider, userInfo.getId())
                .orElseGet(() -> createUser(userInfo, provider));
    }

    private User createUser(OAuthUserInfo userInfo, Provider provider) {
        String nickname = userInfo.getNickname();
        if (nickname == null || nickname.isBlank()) {
            nickname = "카카오 사용자";
        }

        LocalDateTime now = LocalDateTime.now();

        log.debug("🛠️ 사용자 생성 중 - providerId: {}, nickname: {}, now: {}", userInfo.getId(), nickname, now);

        User user = User.builder()
                .provider(provider)
                .providerId(userInfo.getId())
                .nickname(nickname)
                .deleted(false)
                .createdAt(now)
                .updatedAt(now)
                .build();

        User savedUser = userRepository.save(user);

        log.info("✅ 사용자 저장 완료 - ID: {}, createdAt: {}", savedUser.getId(), savedUser.getCreatedAt());

        return savedUser;
    }

    public TokenRefreshResponse refreshToken(String refreshToken) {
        TokenValidationResult validationResult = jwtTokenProvider.validateToken(refreshToken);
        if (!validationResult.isValid()) {
            throw new CustomException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        String userId = jwtTokenProvider.getUserId(refreshToken).toString();
        String savedRefreshToken = authRedisService.getRefreshToken(userId);

        if (savedRefreshToken == null || !savedRefreshToken.equals(refreshToken)) {
            throw new CustomException(ErrorCode.REFRESH_TOKEN_MISMATCH);
        }

        String newAccessToken = jwtTokenProvider.createAccessToken(userId);
        return new TokenRefreshResponse(newAccessToken);
    }

    public LoginResult handleNaverOAuthLogin(String code, String state) {
        OAuthStrategy strategy = oAuthStrategyMap.get(Provider.NAVER);
        if (!(strategy instanceof NaverOAuthStrategy naverStrategy)) {
            log.error("❌ NAVER 전략이 아님");
            throw new CustomException(ErrorCode.INVALID_OAUTH_PROVIDER);
        }

        try {
            OAuthUserInfo userInfo = naverStrategy.getUserInfo(code, state);
            User user = findOrCreateUser(Provider.NAVER, userInfo);
            String userId = user.getId().toString();

            String accessToken = jwtTokenProvider.createAccessToken(userId);
            String refreshToken = jwtTokenProvider.createRefreshToken(userId);

            authRedisService.saveRefreshToken(userId, refreshToken);

            return LoginResult.of(
                    OAuthLoginResponse.of(accessToken, UserInfoResponse.of(user)),
                    refreshToken
            );
        } catch (Exception e) {
            log.error("[{}] {} - {}", ErrorCode.OAUTH_SERVER_ERROR.name(),
                    ErrorCode.OAUTH_SERVER_ERROR.getMessage(), e.getMessage(), e);
            throw new CustomException(ErrorCode.OAUTH_SERVER_ERROR);
        }
    }
}
