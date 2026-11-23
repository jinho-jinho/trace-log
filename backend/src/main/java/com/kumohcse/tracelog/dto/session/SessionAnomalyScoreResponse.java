package com.kumohcse.tracelog.dto.session;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SessionAnomalyScoreResponse(
    BigDecimal anomalyScore,
    BigDecimal exceededReferencePercentile,
    String modelLabel,
    LocalDateTime analyzedAt
) {
}
