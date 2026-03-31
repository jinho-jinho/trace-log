package com.kumohcse.tracelog.dto.auth;

public record AuthResponse(
    String message,
    AuthUserResponse user
) {
}
