package com.kumohcse.tracelog.dto.session;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SessionRequestLogDetailItemResponse(
    Integer sequenceNo,
    LocalDateTime requestTime,
    String method,
    String uri,
    Integer statusCode,
    Long responseBytes,
    String referer,
    String label,
    String endpoint,
    String queryString,
    Integer uriLength,
    Integer queryLength,
    Integer specialCharCount,
    BigDecimal specialCharRatio,
    Integer suspiciousKeywordCount,
    Boolean isLoginEndpoint,
    Boolean isAdminEndpoint,
    Boolean isLoginAttempt
) {
}
