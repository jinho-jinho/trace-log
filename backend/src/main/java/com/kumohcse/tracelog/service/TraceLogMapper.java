package com.kumohcse.tracelog.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Component;

import com.kumohcse.tracelog.domain.DetectionSetting;
import com.kumohcse.tracelog.domain.Session;
import com.kumohcse.tracelog.domain.SessionFeature;
import com.kumohcse.tracelog.domain.SessionFeatureContribution;
import com.kumohcse.tracelog.domain.SessionLlmSummary;
import com.kumohcse.tracelog.domain.SessionRequestLog;
import com.kumohcse.tracelog.dto.session.AnomalyScoreTrendPointResponse;
import com.kumohcse.tracelog.dto.session.DashboardHeaderResponse;
import com.kumohcse.tracelog.dto.session.DashboardSessionSummaryResponse;
import com.kumohcse.tracelog.dto.session.SessionAiAnalysisResponse;
import com.kumohcse.tracelog.dto.session.SessionAnomalyScoreResponse;
import com.kumohcse.tracelog.dto.session.SessionDetailResponse;
import com.kumohcse.tracelog.dto.session.SessionFeatureContributionResponse;
import com.kumohcse.tracelog.dto.session.SessionFeatureMetricsResponse;
import com.kumohcse.tracelog.dto.session.SessionInfoResponse;
import com.kumohcse.tracelog.dto.session.SessionListItemResponse;
import com.kumohcse.tracelog.dto.session.SessionListResponse;
import com.kumohcse.tracelog.dto.session.SessionLogDetailResponse;
import com.kumohcse.tracelog.dto.session.SessionLogPreviewResponse;
import com.kumohcse.tracelog.dto.session.SessionRequestLogDetailItemResponse;
import com.kumohcse.tracelog.dto.session.TraceLogDashboardResponse;

@Component
public class TraceLogMapper {

    private static final int DETAIL_PREVIEW_LIMIT = 30;

    public DashboardHeaderResponse toDashboardHeader(
        BigDecimal averageAnomalyScore,
        long anomalySessionCount,
        BigDecimal anomalySessionRatio,
        long anomalyIpCount,
        String modelStatus
    ) {
        return new DashboardHeaderResponse(
            averageAnomalyScore,
            anomalySessionCount,
            anomalySessionRatio,
            anomalyIpCount,
            modelStatus
        );
    }

    public AnomalyScoreTrendPointResponse toTrendPoint(
        LocalDateTime bucketStart,
        LocalDateTime bucketEnd,
        BigDecimal averageAnomalyScore
    ) {
        return new AnomalyScoreTrendPointResponse(bucketStart, bucketEnd, averageAnomalyScore);
    }

    public TraceLogDashboardResponse toDashboardResponse(
        DashboardHeaderResponse header,
        List<AnomalyScoreTrendPointResponse> scoreTrend,
        List<Session> anomalySessions,
        List<Session> topAnomalySessions
    ) {
        return new TraceLogDashboardResponse(
            header,
            scoreTrend,
            anomalySessions.stream()
                .map(this::toDashboardSessionSummary)
                .toList(),
            topAnomalySessions.stream()
                .map(this::toDashboardSessionSummary)
                .toList()
        );
    }

    public DashboardSessionSummaryResponse toDashboardSessionSummary(Session session) {
        return new DashboardSessionSummaryResponse(
            session.getId(),
            session.getSessionStart(),
            session.getAnomalyScore(),
            getAiAnalysis(session)
        );
    }

    public SessionListResponse toSessionListResponse(long totalCount, List<Session> sessions) {
        return new SessionListResponse(
            totalCount,
            sessions.stream()
                .map(this::toSessionListItem)
                .toList()
        );
    }

    public SessionListItemResponse toSessionListItem(Session session) {
        return new SessionListItemResponse(
            session.getId(),
            session.getSessionStart(),
            session.getSessionEnd(),
            session.getIp(),
            session.getUserAgent(),
            session.getAnomalyScore(),
            session.getAnalyzedAt(),
            getAiAnalysis(session)
        );
    }

    public SessionDetailResponse toSessionDetail(Session session, DetectionSetting detectionSetting) {
        List<SessionRequestLog> previewLogs = getSortedLogs(session).stream()
            .limit(DETAIL_PREVIEW_LIMIT)
            .toList();

        return new SessionDetailResponse(
            toSessionInfo(session),
            previewLogs.stream()
                .map(this::toSessionLogPreview)
                .toList(),
            buildRawLogText(previewLogs),
            toSessionFeatureMetrics(session.getFeature()),
            getSortedFeatureContributions(session).stream()
                .map(this::toFeatureContribution)
                .toList(),
            toSessionAnomalyScore(session, detectionSetting)
        );
    }

    public SessionInfoResponse toSessionInfo(Session session) {
        return new SessionInfoResponse(
            session.getId(),
            session.getIp(),
            session.getUserAgent(),
            session.getSessionStart(),
            session.getSessionEnd(),
            formatDuration(session.getDurationSec()),
            session.getRequestCount(),
            getAiAnalysis(session)
        );
    }

    public SessionLogPreviewResponse toSessionLogPreview(SessionRequestLog log) {
        return new SessionLogPreviewResponse(
            log.getSequenceNo(),
            log.getMethod(),
            log.getUri(),
            log.getStatusCode()
        );
    }

    public SessionFeatureMetricsResponse toSessionFeatureMetrics(SessionFeature feature) {
        if (feature == null) {
            return null;
        }

        return new SessionFeatureMetricsResponse(
            feature.getUniqueUrlCount(),
            feature.getUniqueMethodCount(),
            feature.getAvgRequestIntervalSec(),
            feature.getMaxRequestIntervalSec(),
            feature.getMinRequestIntervalSec(),
            feature.getError4xxRatio(),
            feature.getError5xxRatio(),
            feature.getStatus200Count(),
            feature.getAvgBytes(),
            feature.getMaxBytes(),
            feature.getStdBytes(),
            feature.getLoginCount(),
            feature.getAdminCount(),
            feature.getAvgUriLength(),
            feature.getMaxUriLength(),
            feature.getAvgQueryLength(),
            feature.getMaxQueryLength(),
            feature.getSpecialCharCountSum(),
            feature.getSpecialCharRatioAvg(),
            feature.getSuspiciousKeywordCountSum(),
            feature.getLoginAttemptCount()
        );
    }

    public SessionFeatureContributionResponse toFeatureContribution(SessionFeatureContribution contribution) {
        return new SessionFeatureContributionResponse(
            contribution.getFeatureName(),
            contribution.getFeatureValue(),
            contribution.getShapValue()
        );
    }

    public SessionAnomalyScoreResponse toSessionAnomalyScore(Session session, DetectionSetting detectionSetting) {
        return new SessionAnomalyScoreResponse(
            session.getAnomalyScore(),
            session.getAnalyzedAt(),
            detectionSetting == null ? null : detectionSetting.getThresholdValue()
        );
    }

    public SessionLogDetailResponse toSessionLogDetail(List<SessionRequestLog> logs) {
        List<SessionRequestLog> sortedLogs = logs.stream()
            .sorted(Comparator.comparing(SessionRequestLog::getSequenceNo))
            .toList();

        return new SessionLogDetailResponse(
            sortedLogs.size(),
            sortedLogs.stream()
                .map(this::toSessionRequestLogDetailItem)
                .toList(),
            buildRawLogText(sortedLogs)
        );
    }

    public SessionRequestLogDetailItemResponse toSessionRequestLogDetailItem(SessionRequestLog log) {
        return new SessionRequestLogDetailItemResponse(
            log.getSequenceNo(),
            log.getRequestTime(),
            log.getMethod(),
            log.getUri(),
            log.getStatusCode(),
            log.getResponseBytes(),
            log.getReferer(),
            log.getLabel(),
            log.getEndpoint(),
            log.getQueryString(),
            log.getUriLength(),
            log.getQueryLength(),
            log.getSpecialCharCount(),
            log.getSpecialCharRatio(),
            log.getSuspiciousKeywordCount(),
            log.getIsLoginEndpoint(),
            log.getIsAdminEndpoint(),
            log.getIsLoginAttempt()
        );
    }

    public SessionAiAnalysisResponse toSessionAiAnalysisResponse(Session session) {
        SessionLlmSummary summary = session.getLlmSummary();
        return new SessionAiAnalysisResponse(
            session.getId(),
            summary == null ? null : summary.getSummaryText(),
            summary == null ? null : summary.getCreatedAt()
        );
    }

    private List<SessionRequestLog> getSortedLogs(Session session) {
        return session.getRequestLogs().stream()
            .sorted(Comparator.comparing(SessionRequestLog::getSequenceNo))
            .toList();
    }

    private List<SessionFeatureContribution> getSortedFeatureContributions(Session session) {
        return session.getFeatureContributions().stream()
            .sorted(Comparator
                .comparing(SessionFeatureContribution::getAbsShapValue, Comparator.nullsLast(BigDecimal::compareTo))
                .reversed()
                .thenComparing(SessionFeatureContribution::getId))
            .toList();
    }

    private String getAiAnalysis(Session session) {
        SessionLlmSummary llmSummary = session.getLlmSummary();
        return llmSummary == null ? null : llmSummary.getSummaryText();
    }

    private String buildRawLogText(List<SessionRequestLog> logs) {
        return logs.stream()
            .map(SessionRequestLog::getDisplayRawLog)
            .filter(Objects::nonNull)
            .filter(rawLog -> !rawLog.isBlank())
            .collect(java.util.stream.Collectors.joining(System.lineSeparator()));
    }

    private String formatDuration(BigDecimal durationSec) {
        if (durationSec == null) {
            return null;
        }

        long totalSeconds = durationSec.setScale(0, RoundingMode.DOWN).longValue();
        Duration duration = Duration.ofSeconds(totalSeconds);
        long hours = duration.toHours();
        long minutes = duration.toMinutesPart();
        long seconds = duration.toSecondsPart();
        return "%02d:%02d:%02d".formatted(hours, minutes, seconds);
    }
}
