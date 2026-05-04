package com.kumohcse.tracelog.service;

import java.math.BigDecimal;
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
        BigDecimal scoreGap = session.getAnomalyScore().subtract(detectionSetting.getThresholdValue());
        if (scoreGap.signum() < 0) {
            return false;
        }

        String severity = scoreGap.compareTo(new BigDecimal("0.200000")) >= 0
            ? Notification.SEVERITY_DANGER
            : Notification.SEVERITY_SUSPICIOUS;
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
            notificationRepository.save(Notification.anomalySession(admin, session, severity, scoreGap));
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
            Notification.SEVERITY_DANGER.equals(severity) ? "위험" : "의심",
            notification.getTitle(),
            notification.getMessage(),
            notification.getScoreGap(),
            notification.isRead(),
            notification.getReadAt(),
            notification.getCreatedAt()
        );
    }
}
