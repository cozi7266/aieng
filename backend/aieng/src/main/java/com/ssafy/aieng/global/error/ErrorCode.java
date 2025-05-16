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

    // DB
    DATABASE_ERROR(500, "D001", "데이터베이스 오류가 발생했습니다."),

    // USER
    USER_NOT_FOUND(404, "U001", "유저를 찾을 수 없습니다."),
    ADDRESS_NOT_FOUND(404, "U002", "주소를 찾을 수 없습니다."),
    BIRTHDATE_INVALID(400, "U003", "유효하지 않은 생년월일입니다."),
    CHILD_NOT_FOUND(404, "U004", "아이를 찾을 수 없습니다."),

    // Child
    FORBIDDEN_CHILD_ACCESS(403, "U005", "해당 자녀 정보에 접근할 수 없습니다."),

    // Session
    SESSION_NOT_FOUND(404, "S001", "학습 세션을 찾을 수 없습니다."),
    SESSION_CREATION_FAILED(500, "S002", "학습 세션 생성에 실패했습니다."),
    INVALID_SESSION_ACCESS(403, "S003", "세션 접근 권한이 없거나 일치하지 않는 정보입니다."),

    // Learning Words
    LEARNING_NOT_FOUND(404, "L001", "학습 단어 정보를 찾을 수 없습니다."),
    LEARNING_ALREADY_EXISTS(409, "L002", "이미 학습 세션에 단어가 존재합니다."),
    LEARNING_UPDATE_FAILED(500, "L003", "학습 정보를 업데이트하는 데 실패했습니다."),

    // QUIZ
    QUIZ_ALREADY_EXISTS(409, "Q001", "퀴즈가 이미 존재합니다."),
    QUIZ_NOT_FOUND(404, "Q002", "퀴즈가 존재하지 않습니다."),
    QUIZ_CREATION_FAILED(400, "Q003", "퀴즈 생성 조건을 만족하지 않습니다."),


    // Theme
    THEME_NOT_FOUND(404, "T001", "테마를 찾을 수 없습니다."),
    THEME_ALREADY_EXISTS(409, "T002", "이미 존재하는 테마입니다."),
    THEME_INVALID_TOTAL_WORDS(400, "T003", "유효하지 않은 단어 수입니다."),

    // Word
    WORD_NOT_FOUND(404, "W001", "단어를 찾을 수 없습니다."),
    WORD_ALREADY_EXISTS(409, "W002", "이미 존재하는 단어입니다."),
    WORD_IMAGE_NOT_FOUND(404, "W003", "단어의 이미지가 존재하지 않습니다."),
    NOT_ENOUGH_WORDS(400, "W004", "해당 테마에는 단어가 최소 6개 이상 필요합니다."),

    // Book (Storybook)
    BOOK_NOT_FOUND(404, "B001", "그림책을 찾을 수 없습니다."),
    BOOK_CREATION_FAILED(500, "B002", "그림책 생성에 실패했습니다."),
    BOOK_NO_COMPLETED_LEARNING(400, "B003", "완료된 학습이 없어 그림책을 생성할 수 없습니다."),
    BOOK_INVALID_THEME(400, "B004", "유효하지 않은 테마입니다."),

    // Dictionary
    DICTIONARY_WORD_NOT_FOUND(404, "DC001", "단어를 찾을 수 없습니다."),
    DICTIONARY_NO_LEARNED_WORDS(404, "DC002", "학습한 단어가 없습니다."),
    DICTIONARY_INVALID_CHILD(400, "DC003", "유효하지 않은 아이 정보입니다."),
    DICTIONARY_ACCESS_DENIED(403, "DC004", "단어장에 접근할 수 있는 권한이 없습니다."),
    DICTIONARY_INVALID_WORD(400, "DC005", "유효하지 않은 단어 정보입니다."),
    DICTIONARY_LOAD_FAILED(500, "DC006", "단어장을 불러오는데 실패했습니다."),

    // Voice
    VOICE_FILE_NOT_FOUND(404, "V001", "음성 파일을 찾을 수 없습니다."),
    VOICE_FILE_TOO_LARGE(400, "V002", "음성 파일이 너무 큽니다."),
    VOICE_INVALID_FILE_FORMAT(400, "V003", "지원하지 않는 음성 파일 형식입니다."),
    VOICE_UPLOAD_FAILED(500, "V004", "음성 파일 업로드에 실패했습니다."),
    VOICE_FILE_TOO_SHORT(400, "V005", "음성 파일이 너무 짧습니다."),
    VOICE_NOT_FOUND(404, "V006", "Voice not found"),
    DEFAULT_VOICES_NOT_FOUND(404, "V007", "기본 목소리 목록을 찾을 수 없습니다."),
    DEFAULT_VOICES_LOAD_FAILED(500, "V008", "기본 목소리 목록을 불러오는데 실패했습니다."),

    // Mood 관련 에러
    MOOD_NOT_FOUND(404, "M001", "Mood not found"),

    // Storybook 관련 에러
    STORYBOOK_NOT_FOUND(404, "SB001", "그림책을 찾을 수 없습니다."),
    STORYBOOK_CREATION_FAILED(400, "SB002", "그림책을 생성할 수 없습니다."),

    // Song 관련 에러
    SONG_NOT_FOUND(404, "SG001", "동요를 찾을 수 없습니다."),
    SONG_ALREADY_DELETED(400, "SG002", "이미 삭제된 동요입니다.");


    private final int status;
    private final String code;
    private final String message;
}
