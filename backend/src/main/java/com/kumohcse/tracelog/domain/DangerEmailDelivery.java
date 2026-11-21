package com.kumohcse.tracelog.domain;

import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SourceType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "danger_email_outbox", indexes = {
    @Index(name = "idx_danger_email_outbox_pending", columnList = "status, next_attempt_at"),
    @Index(name = "idx_danger_email_outbox_lease", columnList = "status, lease_until")
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DangerEmailDelivery {

    @Id
    @Column(name = "notification_id")
    private Long notificationId;

    @Column(nullable = false)
    private String recipient;

    @Column(nullable = false)
    private String subject;

    @Column(name = "plain_text", nullable = false, columnDefinition = "TEXT")
    private String plainText;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String html;

    @Column(nullable = false, length = 10)
    private String status = "PENDING";

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount;

    @CreationTimestamp(source = SourceType.DB)
    @Column(name = "next_attempt_at", nullable = false)
    private Instant nextAttemptAt;

    @Column(name = "lease_until")
    private Instant leaseUntil;

    @Column(name = "claim_token", length = 36)
    private String claimToken;

    @Column(name = "sent_at")
    private Instant sentAt;

    @Column(name = "last_error", length = 120)
    private String lastError;

    public DangerEmailDelivery(Long notificationId, String recipient, String subject, String plainText, String html) {
        this.notificationId = notificationId;
        this.recipient = recipient;
        this.subject = subject;
        this.plainText = plainText;
        this.html = html;
    }
}
