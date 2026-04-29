package com.kumohcse.tracelog.dto.session;

import java.math.BigDecimal;

public record SessionFeatureMetricsResponse(
    Integer uniqueUrlCount,
    Integer uniqueMethodCount,
    BigDecimal avgRequestIntervalSec,
    BigDecimal maxRequestIntervalSec,
    BigDecimal minRequestIntervalSec,
    BigDecimal error4xxRatio,
    BigDecimal error5xxRatio,
    Integer status200Count,
    BigDecimal avgBytes,
    Long maxBytes,
    BigDecimal stdBytes,
    Integer loginCount,
    Integer adminCount,
    BigDecimal avgUriLength,
    Integer maxUriLength,
    BigDecimal avgQueryLength,
    Integer maxQueryLength,
    Integer specialCharCountSum,
    BigDecimal specialCharRatioAvg,
    Integer suspiciousKeywordCountSum,
    Integer loginAttemptCount
) {
}
