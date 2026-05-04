package com.kumohcse.tracelog.dto.session;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record NotificationItemResponse(
    Long id,
    Long sessionId,
    String type,
    String severity,
    String severityLabel,
    String title,
    String message,
    BigDecimal scoreGap,
    boolean read,
    LocalDateTime readAt,
    LocalDateTime createdAt
) {
}
