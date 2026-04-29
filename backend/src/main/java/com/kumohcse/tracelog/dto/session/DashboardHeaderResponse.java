package com.kumohcse.tracelog.dto.session;

import java.math.BigDecimal;

public record DashboardHeaderResponse(
    BigDecimal averageAnomalyScore,
    long anomalySessionCount,
    BigDecimal anomalySessionRatio,
    long anomalyIpCount,
    String modelStatus
) {
}
