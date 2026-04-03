package com.kumohcse.tracelog.domain;

import com.fasterxml.jackson.annotation.JsonValue;

public enum UserRole {
    CUSTOMER,
    ADMIN;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }
}
