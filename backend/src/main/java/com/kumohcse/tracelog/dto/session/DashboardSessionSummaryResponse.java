package com.kumohcse.tracelog.dto.session;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DashboardSessionSummaryResponse(
    Long id,
    LocalDateTime sessionStart,
    BigDecimal anomalyScore,
    String aiAnalysis
) {
}
