package com.kumohcse.tracelog.dto.session;

import java.util.List;

public record SessionListResponse(
    long totalCount,
    List<SessionListItemResponse> sessions
) {
}
