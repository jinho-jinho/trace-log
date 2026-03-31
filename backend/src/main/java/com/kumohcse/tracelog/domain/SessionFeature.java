package com.kumohcse.tracelog.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "session_features")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SessionFeature {

    @Id
    @Column(name = "session_id")
    private Long id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @Column(name = "unique_url_count")
    private Integer uniqueUrlCount;

    @Column(name = "unique_method_count")
    private Integer uniqueMethodCount;

    @Column(name = "avg_request_interval_sec", precision = 12, scale = 3)
    private BigDecimal avgRequestIntervalSec;

    @Column(name = "max_request_interval_sec", precision = 12, scale = 3)
    private BigDecimal maxRequestIntervalSec;

    @Column(name = "min_request_interval_sec", precision = 12, scale = 3)
    private BigDecimal minRequestIntervalSec;

    @Column(name = "error_4xx_ratio", precision = 8, scale = 6)
    private BigDecimal error4xxRatio;

    @Column(name = "error_5xx_ratio", precision = 8, scale = 6)
    private BigDecimal error5xxRatio;

    @Column(name = "status_200_count")
    private Integer status200Count;

    @Column(name = "avg_bytes", precision = 14, scale = 3)
    private BigDecimal avgBytes;

    @Column(name = "max_bytes")
    private Long maxBytes;

    @Column(name = "std_bytes", precision = 14, scale = 4)
    private BigDecimal stdBytes;

    @Column(name = "url_sequence", columnDefinition = "TEXT")
    private String urlSequence;

    @Column(name = "status_sequence", columnDefinition = "TEXT")
    private String statusSequence;

    @Column(name = "method_sequence", columnDefinition = "TEXT")
    private String methodSequence;

    @Column(name = "login_count")
    private Integer loginCount;

    @Column(name = "admin_count")
    private Integer adminCount;

    @Column(name = "avg_uri_length", precision = 12, scale = 4)
    private BigDecimal avgUriLength;

    @Column(name = "max_uri_length")
    private Integer maxUriLength;

    @Column(name = "avg_query_length", precision = 12, scale = 4)
    private BigDecimal avgQueryLength;

    @Column(name = "max_query_length")
    private Integer maxQueryLength;

    @Column(name = "special_char_count_sum")
    private Integer specialCharCountSum;

    @Column(name = "special_char_ratio_avg", precision = 12, scale = 6)
    private BigDecimal specialCharRatioAvg;

    @Column(name = "suspicious_keyword_count_sum")
    private Integer suspiciousKeywordCountSum;

    @Column(name = "login_attempt_count")
    private Integer loginAttemptCount;

    @CreationTimestamp
    @Column(name = "feature_calculated_at", nullable = false)
    private LocalDateTime featureCalculatedAt;
}
