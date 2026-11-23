package com.kumohcse.tracelog.dto.session;

import java.util.List;

public record TraceLogDashboardResponse(
    DashboardHeaderResponse header,
    List<AnomalyScoreTrendPointResponse> scoreTrend,
    List<DashboardSessionSummaryResponse> recentSessions,
    List<DashboardSessionSummaryResponse> topScoredSessions
) {
}
