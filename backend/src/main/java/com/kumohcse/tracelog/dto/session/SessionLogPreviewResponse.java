package com.kumohcse.tracelog.dto.session;

public record SessionLogPreviewResponse(
    Integer sequenceNo,
    String method,
    String uri,
    Integer statusCode
) {
}
