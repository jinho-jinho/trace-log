package com.kumohcse.tracelog.dto.session;

import java.time.LocalDateTime;

public record SessionAiAnalysisResponse(
    Long sessionId,
    String aiAnalysis,
    LocalDateTime createdAt
) {
}
