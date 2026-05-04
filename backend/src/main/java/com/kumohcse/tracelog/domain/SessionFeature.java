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

    public static SessionFeature create(
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
        SessionFeature feature = new SessionFeature();
        feature.uniqueUrlCount = uniqueUrlCount;
        feature.uniqueMethodCount = uniqueMethodCount;
        feature.avgRequestIntervalSec = avgRequestIntervalSec;
        feature.maxRequestIntervalSec = maxRequestIntervalSec;
        feature.minRequestIntervalSec = minRequestIntervalSec;
        feature.error4xxRatio = error4xxRatio;
        feature.error5xxRatio = error5xxRatio;
        feature.status200Count = status200Count;
        feature.avgBytes = avgBytes;
        feature.maxBytes = maxBytes;
        feature.stdBytes = stdBytes;
        feature.urlSequence = urlSequence;
        feature.statusSequence = statusSequence;
        feature.methodSequence = methodSequence;
        feature.loginCount = loginCount;
        feature.adminCount = adminCount;
        feature.avgUriLength = avgUriLength;
        feature.maxUriLength = maxUriLength;
        feature.avgQueryLength = avgQueryLength;
        feature.maxQueryLength = maxQueryLength;
        feature.specialCharCountSum = specialCharCountSum;
        feature.specialCharRatioAvg = specialCharRatioAvg;
        feature.suspiciousKeywordCountSum = suspiciousKeywordCountSum;
        feature.loginAttemptCount = loginAttemptCount;
        feature.featureCalculatedAt = featureCalculatedAt;
        return feature;
    }

    void assignSession(Session session) {
        this.session = session;
        this.id = session.getId();
    }

    void updateFrom(SessionFeature source) {
        this.uniqueUrlCount = source.uniqueUrlCount;
        this.uniqueMethodCount = source.uniqueMethodCount;
        this.avgRequestIntervalSec = source.avgRequestIntervalSec;
        this.maxRequestIntervalSec = source.maxRequestIntervalSec;
        this.minRequestIntervalSec = source.minRequestIntervalSec;
        this.error4xxRatio = source.error4xxRatio;
        this.error5xxRatio = source.error5xxRatio;
        this.status200Count = source.status200Count;
        this.avgBytes = source.avgBytes;
        this.maxBytes = source.maxBytes;
        this.stdBytes = source.stdBytes;
        this.urlSequence = source.urlSequence;
        this.statusSequence = source.statusSequence;
        this.methodSequence = source.methodSequence;
        this.loginCount = source.loginCount;
        this.adminCount = source.adminCount;
        this.avgUriLength = source.avgUriLength;
        this.maxUriLength = source.maxUriLength;
        this.avgQueryLength = source.avgQueryLength;
        this.maxQueryLength = source.maxQueryLength;
        this.specialCharCountSum = source.specialCharCountSum;
        this.specialCharRatioAvg = source.specialCharRatioAvg;
        this.suspiciousKeywordCountSum = source.suspiciousKeywordCountSum;
        this.loginAttemptCount = source.loginAttemptCount;
        if (source.featureCalculatedAt != null) {
            this.featureCalculatedAt = source.featureCalculatedAt;
        }
    }
}
