package com.kumohcse.tracelog.dto.session;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record PipelineSessionImportRequest(
    @JsonProperty("external_session_id")
    @JsonAlias("session_id")
    String externalSessionId,

    @NotBlank
    String ip,

    @JsonProperty("user_agent")
    @NotBlank
    String userAgent,

    @JsonProperty("session_start")
    @NotNull
    LocalDateTime sessionStart,

    @JsonProperty("session_end")
    @NotNull
    LocalDateTime sessionEnd,

    @JsonProperty("duration_sec")
    @NotNull
    @PositiveOrZero
    BigDecimal durationSec,

    @JsonProperty("request_count")
    @NotNull
    @PositiveOrZero
    Integer requestCount,

    @JsonProperty("anomaly_score")
    @PositiveOrZero
    BigDecimal anomalyScore,

    @JsonProperty("analyzed_at")
    LocalDateTime analyzedAt,

    @JsonProperty("request_logs")
    @Valid
    List<RequestLogPayload> requestLogs,

    @JsonProperty("session_feature")
    @JsonAlias("feature")
    @Valid
    FeaturePayload sessionFeature,

    @JsonProperty("session_feature_contributions")
    @JsonAlias({"feature_contributions", "shap_values"})
    @Valid
    List<FeatureContributionPayload> sessionFeatureContributions
) {

    public record RequestLogPayload(
        @JsonProperty("sequence_no")
        @JsonAlias("event_index")
        @NotNull
        @PositiveOrZero
        Integer sequenceNo,

        @JsonProperty("request_time")
        @JsonAlias("time")
        @NotNull
        LocalDateTime requestTime,

        @NotBlank
        String method,

        @NotBlank
        String uri,

        @JsonProperty("status_code")
        @JsonAlias("status")
        Integer statusCode,

        @JsonProperty("response_bytes")
        @JsonAlias("bytes")
        Long responseBytes,

        String referer,
        String source,
        String label,
        String endpoint,

        @JsonProperty("query_string")
        String queryString,

        @JsonProperty("uri_length")
        Integer uriLength,

        @JsonProperty("query_length")
        Integer queryLength,

        @JsonProperty("special_char_count")
        Integer specialCharCount,

        @JsonProperty("special_char_ratio")
        BigDecimal specialCharRatio,

        @JsonProperty("suspicious_keyword_count")
        Integer suspiciousKeywordCount,

        @JsonProperty("is_login_endpoint")
        Boolean isLoginEndpoint,

        @JsonProperty("is_admin_endpoint")
        Boolean isAdminEndpoint,

        @JsonProperty("is_login_attempt")
        Boolean isLoginAttempt,

        @JsonProperty("raw_log")
        String rawLog
    ) {
    }

    public record FeaturePayload(
        @JsonProperty("unique_url_count")
        Integer uniqueUrlCount,

        @JsonProperty("unique_method_count")
        Integer uniqueMethodCount,

        @JsonProperty("avg_request_interval_sec")
        BigDecimal avgRequestIntervalSec,

        @JsonProperty("max_request_interval_sec")
        BigDecimal maxRequestIntervalSec,

        @JsonProperty("min_request_interval_sec")
        BigDecimal minRequestIntervalSec,

        @JsonProperty("error_4xx_ratio")
        BigDecimal error4xxRatio,

        @JsonProperty("error_5xx_ratio")
        BigDecimal error5xxRatio,

        @JsonProperty("status_200_count")
        Integer status200Count,

        @JsonProperty("avg_bytes")
        BigDecimal avgBytes,

        @JsonProperty("max_bytes")
        Long maxBytes,

        @JsonProperty("std_bytes")
        BigDecimal stdBytes,

        @JsonProperty("url_sequence")
        String urlSequence,

        @JsonProperty("status_sequence")
        String statusSequence,

        @JsonProperty("method_sequence")
        String methodSequence,

        @JsonProperty("login_count")
        Integer loginCount,

        @JsonProperty("admin_count")
        Integer adminCount,

        @JsonProperty("avg_uri_length")
        @JsonAlias("avg_url_length")
        BigDecimal avgUriLength,

        @JsonProperty("max_uri_length")
        @JsonAlias("max_url_length")
        Integer maxUriLength,

        @JsonProperty("avg_query_length")
        BigDecimal avgQueryLength,

        @JsonProperty("max_query_length")
        Integer maxQueryLength,

        @JsonProperty("special_char_count_sum")
        Integer specialCharCountSum,

        @JsonProperty("special_char_ratio_avg")
        BigDecimal specialCharRatioAvg,

        @JsonProperty("suspicious_keyword_count_sum")
        Integer suspiciousKeywordCountSum,

        @JsonProperty("login_attempt_count")
        Integer loginAttemptCount,

        @JsonProperty("feature_calculated_at")
        LocalDateTime featureCalculatedAt
    ) {
    }

    public record FeatureContributionPayload(
        @JsonProperty("feature_name")
        @JsonAlias("name")
        @NotBlank
        String featureName,

        @JsonProperty("feature_value")
        @JsonAlias("value")
        BigDecimal featureValue,

        @JsonProperty("shap_value")
        @JsonAlias({"shap", "importance"})
        @NotNull
        BigDecimal shapValue,

        @JsonProperty("abs_shap_value")
        BigDecimal absShapValue
    ) {
    }
}
