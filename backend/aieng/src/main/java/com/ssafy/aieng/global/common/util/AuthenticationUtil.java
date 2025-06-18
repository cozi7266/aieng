package com.ssafy.aieng.global.common.util;

import com.ssafy.aieng.domain.user.repository.UserRepository;
import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.exception.CustomException;
import com.ssafy.aieng.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthenticationUtil {

    private final UserRepository userRepository;

    public Integer getCurrentUserId(UserPrincipal userPrincipal) {
        if (userPrincipal == null || userPrincipal.getId() == null || !userRepository.existsById(userPrincipal.getId())) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        return userPrincipal.getId();
    }
}
