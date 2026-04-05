package com.kumohcse.tracelog.dto.session;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
//임시
public record SessionInferenceRequest(
    SessionPayload session,
    @JsonProperty("session_feature")
    SessionFeaturePayload sessionFeature
) {

    public record SessionPayload(
        Long sessionId,
        String ip,
        String userAgent,
        LocalDateTime sessionStart,
        LocalDateTime sessionEnd,
        BigDecimal durationSec,
        Integer requestCount
    ) {
    }

    public record SessionFeaturePayload(
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
        String urlSequence,
        String statusSequence,
        String methodSequence,
        Integer loginCount,
        Integer adminCount,
        BigDecimal avgUriLength,
        Integer maxUriLength,
        BigDecimal avgQueryLength,
        Integer maxQueryLength,
        Integer specialCharCountSum,
        BigDecimal specialCharRatioAvg,
        Integer suspiciousKeywordCountSum,
        Integer loginAttemptCount,
        LocalDateTime featureCalculatedAt
    ) {
    }
}
