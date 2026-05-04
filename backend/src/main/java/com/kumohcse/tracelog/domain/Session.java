package com.kumohcse.tracelog.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "sessions")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Session extends BaseCreatedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 45)
    private String ip;

    @Column(name = "user_agent", nullable = false, columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "session_start", nullable = false)
    private LocalDateTime sessionStart;

    @Column(name = "session_end", nullable = false)
    private LocalDateTime sessionEnd;

    @Column(name = "duration_sec", nullable = false, precision = 12, scale = 3)
    private BigDecimal durationSec;

    @Column(name = "request_count", nullable = false)
    private Integer requestCount;

    @Column(name = "anomaly_score", precision = 8, scale = 6)
    private BigDecimal anomalyScore;

    @Column(name = "analyzed_at")
    private LocalDateTime analyzedAt;

    @OrderBy("sequenceNo ASC")
    @OneToMany(mappedBy = "session", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<SessionRequestLog> requestLogs = new LinkedHashSet<>();

    @OneToOne(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private SessionFeature feature;

    @OneToOne(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private SessionLlmSummary llmSummary;

    @OrderBy("absShapValue DESC, id ASC")
    @OneToMany(mappedBy = "session", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<SessionFeatureContribution> featureContributions = new LinkedHashSet<>();

    public static Session create(
        String ip,
        String userAgent,
        LocalDateTime sessionStart,
        LocalDateTime sessionEnd,
        BigDecimal durationSec,
        Integer requestCount
    ) {
        Session session = new Session();
        session.ip = ip;
        session.userAgent = userAgent;
        session.sessionStart = sessionStart;
        session.sessionEnd = sessionEnd;
        session.durationSec = durationSec;
        session.requestCount = requestCount;
        return session;
    }

    public void updateSummary(
        String ip,
        String userAgent,
        LocalDateTime sessionStart,
        LocalDateTime sessionEnd,
        BigDecimal durationSec,
        Integer requestCount
    ) {
        this.ip = ip;
        this.userAgent = userAgent;
        this.sessionStart = sessionStart;
        this.sessionEnd = sessionEnd;
        this.durationSec = durationSec;
        this.requestCount = requestCount;
    }

    public void applyAnalysis(BigDecimal anomalyScore, LocalDateTime analyzedAt) {
        this.anomalyScore = anomalyScore;
        this.analyzedAt = analyzedAt;
    }

    public void replaceRequestLogs(Set<SessionRequestLog> requestLogs) {
        this.requestLogs.clear();
        requestLogs.forEach(log -> log.assignSession(this));
        this.requestLogs.addAll(requestLogs);
    }

    public void replaceFeature(SessionFeature feature) {
        if (feature == null) {
            this.feature = null;
            return;
        }
        if (this.feature != null) {
            this.feature.updateFrom(feature);
            return;
        }
        feature.assignSession(this);
        this.feature = feature;
    }

    public void replaceFeatureContributions(Set<SessionFeatureContribution> featureContributions) {
        this.featureContributions.clear();
        featureContributions.forEach(contribution -> contribution.assignSession(this));
        this.featureContributions.addAll(featureContributions);
    }
}
