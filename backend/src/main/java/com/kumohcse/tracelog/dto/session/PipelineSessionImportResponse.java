package com.kumohcse.tracelog.dto.session;

import java.math.BigDecimal;

public record PipelineSessionImportResponse(
    Long sessionId,
    String externalSessionId,
    BigDecimal anomalyScore,
    boolean created,
    boolean notificationCreated
) {
}
