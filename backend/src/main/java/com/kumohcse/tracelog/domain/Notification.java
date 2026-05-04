package com.kumohcse.tracelog.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "notifications")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification extends BaseCreatedEntity {

    public static final String TYPE_ANOMALY_SESSION = "ANOMALY_SESSION";
    public static final String SEVERITY_SUSPICIOUS = "suspicious";
    public static final String SEVERITY_DANGER = "danger";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private Session session;

    @Column(name = "notification_type", nullable = false, length = 50)
    private String notificationType;

    @Column(nullable = false, length = 20)
    private String severity;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "score_gap", precision = 8, scale = 6)
    private BigDecimal scoreGap;

    @Column(name = "is_read", nullable = false)
    private boolean read;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    public static Notification anomalySession(
        User user,
        Session session,
        String severity,
        BigDecimal scoreGap
    ) {
        Notification notification = new Notification();
        notification.user = user;
        notification.session = session;
        notification.notificationType = TYPE_ANOMALY_SESSION;
        notification.severity = severity;
        notification.title = "이상 세션 감지";
        notification.message = "세션 " + session.getId() + "의 이상 점수가 설정 임계치를 초과했습니다.";
        notification.scoreGap = scoreGap;
        notification.read = false;
        return notification;
    }

    public void markRead() {
        if (read) {
            return;
        }
        read = true;
        readAt = LocalDateTime.now();
    }
}
