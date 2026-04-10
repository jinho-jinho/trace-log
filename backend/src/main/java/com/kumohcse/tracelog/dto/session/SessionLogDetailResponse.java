package com.kumohcse.tracelog.dto.session;

import java.util.List;

public record SessionLogDetailResponse(
    long totalCount,
    List<SessionRequestLogDetailItemResponse> logs,
    String rawLogs
) {
}
