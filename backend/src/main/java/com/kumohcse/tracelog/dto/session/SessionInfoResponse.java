package com.kumohcse.tracelog.dto.session;

import java.time.LocalDateTime;

public record SessionInfoResponse(
    Long id,
    String ip,
    String userAgent,
    LocalDateTime sessionStart,
    LocalDateTime sessionEnd,
    String sessionLength,
    Integer requestCount,
    String aiAnalysis
) {
}
