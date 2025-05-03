package com.ssafy.aieng.global.common.response;

import com.ssafy.aieng.global.error.ErrorCode;
import com.ssafy.aieng.global.error.ErrorResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;

@Getter
@AllArgsConstructor
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final ErrorResponse error;

    public static <T> ResponseEntity<ApiResponse<T>> success(T data) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(new ApiResponse<>(true, data, null));
    }

    public static <T> ResponseEntity<ApiResponse<T>> success(T data, HttpStatus status) {
        return ResponseEntity
                .status(status)
                .body(new ApiResponse<>(true, data, null));
    }

    public static <T> ResponseEntity<ApiResponse<T>> success(HttpStatus status) {
        return ResponseEntity
                .status(status)
                .body(new ApiResponse<>(true, null, null));
    }

    public static <T> ResponseEntity<ApiResponse<T>> success(T data, ResponseCookie cookie) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new ApiResponse<>(true, data, null));
    }

    public static <T> ResponseEntity<ApiResponse<T>> error(ErrorCode error) {
        return ResponseEntity
                .status(error.getStatus())
                .body(new ApiResponse<>(false, null, new ErrorResponse(error.getCode(), error.getMessage())));
    }

    public static <T> ResponseEntity<ApiResponse<T>> error(ErrorCode error, String message) {
        return ResponseEntity
                .status(error.getStatus())
                .body(new ApiResponse<>(false, null, new ErrorResponse(error.getCode(), message)));
    }

    public static <T> ResponseEntity<ApiResponse<T>> fail(String message) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, null, new ErrorResponse("COMMON-400", message)));
    }

    // 선택적으로 상태코드 설정 가능
    public static <T> ResponseEntity<ApiResponse<T>> fail(String message, HttpStatus status) {
        return ResponseEntity
                .status(status)
                .body(new ApiResponse<>(false, null, new ErrorResponse("COMMON-" + status.value(), message)));
    }

}
