package com.wellness.platform.common.exception;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {

    private final String code;
    private final HttpStatus status;

    public ApiException(String code, String message, HttpStatus status) {
        super(message);
        this.code = code;
        this.status = status;
    }

    public String getCode() {
        return code;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public static ApiException conflict(String code, String message) {
        return new ApiException(code, message, HttpStatus.CONFLICT);
    }

    public static ApiException badRequest(String code, String message) {
        return new ApiException(code, message, HttpStatus.BAD_REQUEST);
    }

    public static ApiException notFound(String code, String message) {
        return new ApiException(code, message, HttpStatus.NOT_FOUND);
    }

    public static ApiException unauthorized(String code, String message) {
        return new ApiException(code, message, HttpStatus.UNAUTHORIZED);
    }

    public static ApiException forbidden(String code, String message) {
        return new ApiException(code, message, HttpStatus.FORBIDDEN);
    }
}
