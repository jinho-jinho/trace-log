package com.kumohcse.tracelog.dto.session;

import java.util.List;

public record SessionDetailResponse(
    SessionInfoResponse session,
    List<SessionLogPreviewResponse> sessionLogs,
    String rawLogPreview,
    SessionFeatureMetricsResponse metrics,
    List<SessionFeatureContributionResponse> featureContributions,
    SessionAnomalyScoreResponse anomalyScore
) {
}
