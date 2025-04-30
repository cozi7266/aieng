package com.ssafy.aieng.global.error;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    // Common
    INVALID_INPUT_VALUE(400, "C001", "잘못된 입력값입니다"),
    RESOURCE_NOT_FOUND(404, "C002", "요청한 리소스를 찾을 수 없습니다"),
    INTERNAL_SERVER_ERROR(500, "C003", "서버 내부 오류가 발생했습니다"),

    // Authorization
    UNAUTHORIZED_ACCESS(401, "A001", "로그인이 필요한 서비스입니다"),
    FORBIDDEN_ACCESS(403, "A002", "접근 권한이 없습니다"),

    // OAUTH
    OAUTH_SERVER_ERROR(500, "O001", "OAuth 서버 오류가 발생했습니다"),
    INVALID_OAUTH_PROVIDER(400, "O002", "지원하지 않는 OAuth 제공자입니다"),
    INVALID_REFRESH_TOKEN(401, "O003", "Invalid refresh token"),
    REFRESH_TOKEN_NOT_FOUND(401, "O004", "Refresh token not found"),
    REFRESH_TOKEN_MISMATCH(401, "O005", "Refresh token mismatch"),

    // DB
    DATABASE_ERROR(500, "D001", "데이터베이스 오류가 발생했습니다."),

    // USER
    USER_NOT_FOUND(404, "U001", "유저를 찾을 수 없습니다."),
    ADDRESS_NOT_FOUND(404, "U002", "주소를 찾을 수 없습니다."),
    BIRTHDATE_INVALID(400, "U003", "유효하지 않은 생년월일입니다.");




    private final int status;
    private final String code;
    private final String message;
}
