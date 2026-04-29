package com.kumohcse.tracelog.dto.session;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SessionListItemResponse(
    Long id,
    LocalDateTime sessionStart,
    LocalDateTime sessionEnd,
    String ip,
    String userAgent,
    BigDecimal anomalyScore,
    LocalDateTime analyzedAt,
    String aiAnalysis
) {
}
