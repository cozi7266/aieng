package com.ssafy.aieng.global.error;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum  ErrorCode {

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

    // USER
    USER_NOT_FOUND(404, "U001", "유저를 찾을 수 없습니다."),


    // Child
    FORBIDDEN_CHILD_ACCESS(403, " C001", "해당 자녀 정보에 접근할 수 없습니다."),
    INVALID_CHILD_ACCESS(403, "C002", "유효하지 않은 아이입니다."),
    CHILD_NOT_FOUND(404, "C003", "아이를 찾을 수 없습니다."),

    // Session
    SESSION_NOT_FOUND(404, "S001", "학습 세션을 찾을 수 없습니다."),
    SESSION_CREATION_FAILED(500, "S002", "학습 세션 생성에 실패했습니다."),
    INVALID_SESSION_ACCESS(403, "S003", "세션 접근 권한이 없거나 일치하지 않는 정보입니다."),

    // Learning Words
    LEARNING_NOT_FOUND(404, "L001", "학습 단어 정보를 찾을 수 없습니다."),

    // QUIZ
    QUIZ_ALREADY_EXISTS(409, "Q001", "퀴즈가 이미 존재합니다."),
    QUIZ_NOT_FOUND(404, "Q002", "퀴즈가 존재하지 않습니다."),
    QUIZ_CREATION_FAILED(400, "Q003", "퀴즈 생성 조건을 만족하지 않습니다."),
    QUESTION_ALREADY_COMPLETED(400, "Q004", "이미 완료된 문제입니다."),

    // Theme
    THEME_NOT_FOUND(404, "T001", "테마를 찾을 수 없습니다."),

    // Word
    WORD_NOT_FOUND(404, "W001", "단어를 찾을 수 없습니다."),
    NOT_ENOUGH_WORDS(400, "W002", "해당 테마에는 단어가 최소 6개 이상 필요합니다."),

    // Book (Storybook)
    STORYBOOK_NOT_FOUND(404, "B001", "그림책을 찾을 수 없습니다."),
    STORYBOOK_CREATION_FAILED(400, "B002", "그림책을 생성할 수 없습니다."),
    DUPLICATE_STORYBOOK(400, "B003", "이미 해당 세션으로 생성된 그림책이 존재합니다."),

    // Dictionary
    DICTIONARY_INVALID_CHILD(400, "DC001", "유효하지 않은 아이 정보입니다."),

    // Voice
    VOICE_FILE_NOT_FOUND(404, "V001", "음성 파일을 찾을 수 없습니다."),
    VOICE_NOT_FOUND(404, "V002", "Voice not found"),
    CANNOT_DELETE_DEFAULT_VOICE(400, "V003", "디폴트 목소리를 삭제할 수 없습니다."),

    // Mood 관련 에러
    MOOD_NOT_FOUND(404, "M001", "Mood not found"),

    // Song 관련 에러
    SONG_NOT_FOUND(404, "SG001", "동요를 찾을 수 없습니다."),
    DUPLICATE_SONG(409, "SG002", "이미 저장된 동요입니다.");


    private final int status;
    private final String code;
    private final String message;
}
