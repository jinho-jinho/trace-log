package com.kumohcse.tracelog.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kumohcse.tracelog.domain.Notification;
import com.kumohcse.tracelog.dto.session.NotificationItemResponse;
import com.kumohcse.tracelog.dto.session.NotificationListResponse;
import com.kumohcse.tracelog.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final AnomalySeverityPolicy anomalySeverityPolicy;

    @Transactional(readOnly = true)
    public NotificationListResponse getNotifications(Long userId) {
        List<NotificationItemResponse> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(this::toResponse)
            .toList();
        long unreadCount = notificationRepository.countByUserIdAndReadFalse(userId);
        return new NotificationListResponse(unreadCount, notifications);
    }

    @Transactional
    public NotificationListResponse markAllRead(Long userId) {
        notificationRepository.findByUserIdAndReadFalse(userId)
            .forEach(Notification::markRead);
        return getNotifications(userId);
    }

    @Transactional
    public NotificationListResponse markRead(Long userId, Long notificationId) {
        notificationRepository.findByIdAndUserId(notificationId, userId)
            .ifPresent(Notification::markRead);
        return getNotifications(userId);
    }

    private NotificationItemResponse toResponse(Notification notification) {
        String severity = notification.getSeverity();
        return new NotificationItemResponse(
            notification.getId(),
            notification.getSession() == null ? null : notification.getSession().getId(),
            notification.getNotificationType(),
            severity,
            anomalySeverityPolicy.toLabel(severity),
            notification.getTitle(),
            notification.getMessage(),
            notification.getScoreGap(),
            notification.isRead(),
            notification.getReadAt(),
            notification.getCreatedAt()
        );
    }
}
