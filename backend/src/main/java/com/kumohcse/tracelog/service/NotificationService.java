package com.kumohcse.tracelog.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kumohcse.tracelog.domain.DetectionSetting;
import com.kumohcse.tracelog.domain.Notification;
import com.kumohcse.tracelog.domain.Session;
import com.kumohcse.tracelog.domain.User;
import com.kumohcse.tracelog.domain.UserRole;
import com.kumohcse.tracelog.dto.session.NotificationItemResponse;
import com.kumohcse.tracelog.dto.session.NotificationListResponse;
import com.kumohcse.tracelog.repository.NotificationRepository;
import com.kumohcse.tracelog.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationEmailService notificationEmailService;
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

    @Transactional
    public boolean createAnomalyNotificationsIfNeeded(Session session, DetectionSetting detectionSetting) {
        if (session.getAnomalyScore() == null || detectionSetting == null) {
            return false;
        }
        if (session.getRequestCount() < detectionSetting.getMinRequestCount()) {
            return false;
        }

        java.math.BigDecimal scoreGap = anomalySeverityPolicy.scoreGap(
            session.getAnomalyScore(),
            detectionSetting.getThresholdValue()
        );
        String severity = anomalySeverityPolicy.resolveSeverity(
            session.getAnomalyScore(),
            detectionSetting.getThresholdValue(),
            detectionSetting.getDangerScoreGap()
        );
        if (AnomalySeverityPolicy.SEVERITY_NORMAL.equals(severity)
            || AnomalySeverityPolicy.SEVERITY_UNCONFIGURED.equals(severity)) {
            return false;
        }

        boolean created = false;
        for (User admin : userRepository.findAll().stream()
            .filter(user -> user.getRole() == UserRole.ADMIN)
            .toList()) {
            if (notificationRepository.existsByUserAndSessionAndNotificationType(
                admin,
                session,
                Notification.TYPE_ANOMALY_SESSION
            )) {
                continue;
            }
            Notification notification = notificationRepository.save(Notification.anomalySession(admin, session, severity, scoreGap));
            if (Notification.SEVERITY_DANGER.equals(severity)) {
                notificationEmailService.sendDangerNotification(admin, session, notification);
            }
            created = true;
        }
        return created;
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
