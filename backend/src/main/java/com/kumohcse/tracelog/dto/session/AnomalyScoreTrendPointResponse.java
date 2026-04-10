package com.kumohcse.tracelog.dto.session;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AnomalyScoreTrendPointResponse(
    LocalDateTime bucketStart,
    LocalDateTime bucketEnd,
    BigDecimal averageAnomalyScore
) {
}
