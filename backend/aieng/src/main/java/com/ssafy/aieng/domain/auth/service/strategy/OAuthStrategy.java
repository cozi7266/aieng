package com.ssafy.aieng.domain.auth.service.strategy;

import com.ssafy.aieng.domain.auth.dto.OAuthUserInfo;

import java.io.IOException;

public interface OAuthStrategy {
    OAuthUserInfo getUserInfo(String code) throws IOException;

}
