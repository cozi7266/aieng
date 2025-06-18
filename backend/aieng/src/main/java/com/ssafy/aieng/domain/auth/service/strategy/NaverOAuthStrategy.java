package com.ssafy.aieng.domain.auth.service.strategy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.aieng.domain.auth.dto.OAuthUserInfo;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import com.ssafy.aieng.global.infra.oauth.client.NaverOAuthClient;
import com.ssafy.aieng.global.infra.oauth.dto.naver.NaverTokenResponse;
import com.ssafy.aieng.global.infra.oauth.dto.naver.NaverUserResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NaverOAuthStrategy implements OAuthStrategy {

    private final NaverOAuthClient naverOAuthClient;

    @Override
    public OAuthUserInfo getUserInfo(String code) throws IOException {
        return getUserInfo(code, "default-state");
    }

    public OAuthUserInfo getUserInfo(String code, String state) throws IOException {


        try {
            // 1. 액세스 토큰 발급 요청
            NaverTokenResponse tokenResponse = naverOAuthClient.getToken(code, state);

            // 필요시 scope 도 출력 (토큰 응답에 포함된다면)
            try {
                ObjectMapper mapper = new ObjectMapper();
            } catch (Exception e) {
            }

            // 2. 사용자 정보 조회 요청
            NaverUserResponse userResponse = naverOAuthClient.getUserInfo(tokenResponse.getAccessToken());

            try {
                ObjectMapper mapper = new ObjectMapper();
            } catch (Exception e) {
            }

            // 3. 사용자 정보 추출
            NaverUserResponse.NaverAccount user = userResponse.getResponse();
            if (user == null) {
                throw new CustomException(ErrorCode.OAUTH_SERVER_ERROR);
            }

            if (user.getId() == null) {
                throw new CustomException(ErrorCode.OAUTH_SERVER_ERROR);
            }


            return OAuthUserInfo.builder()
                    .id(user.getId())
                    .build();

        } catch (IOException e) {
            throw new CustomException(ErrorCode.OAUTH_SERVER_ERROR);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.OAUTH_SERVER_ERROR);
        }
    }
}
