package com.kumohcse.tracelog.service;

import java.io.Serializable;

import com.kumohcse.tracelog.domain.UserRole;
import com.kumohcse.tracelog.dto.auth.AuthUserResponse;

public record AuthSessionUser(
    Long id,
    String email,
    String name,
    UserRole role
) implements Serializable {

    public AuthUserResponse toResponse() {
        return new AuthUserResponse(id, email, name, role);
    }
}
