package com.kumohcse.tracelog.dto.auth;

import com.kumohcse.tracelog.domain.UserRole;

public record AuthUserResponse(
    Long id,
    String email,
    String name,
    UserRole role
) {
}
