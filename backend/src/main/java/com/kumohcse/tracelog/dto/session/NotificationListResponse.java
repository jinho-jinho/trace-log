package com.kumohcse.tracelog.dto.session;

import java.util.List;

public record NotificationListResponse(
    long unreadCount,
    List<NotificationItemResponse> notifications
) {
}
