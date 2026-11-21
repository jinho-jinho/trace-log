package com.kumohcse.tracelog.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.kumohcse.tracelog.domain.DangerEmailDelivery;
import com.kumohcse.tracelog.service.NotificationEmailService.DangerEmail;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DangerEmailOutbox {

    private static final int MAX_ATTEMPTS = 5;

    private final EntityManager entityManager;
    private final JdbcClient jdbc;

    @Transactional(propagation = Propagation.MANDATORY)
    public void enqueue(Long notificationId, DangerEmail email) {
        entityManager.persist(new DangerEmailDelivery(
            notificationId, email.recipient(), email.subject(), email.plainText(), email.html()
        ));
    }

    @Transactional
    public Optional<Claim> claimNext() {
        String token = UUID.randomUUID().toString();
        return jdbc.sql("""
            WITH candidate AS (
                SELECT notification_id FROM danger_email_outbox
                WHERE (status = 'PENDING' AND next_attempt_at <= now())
                   OR (status = 'SENDING' AND lease_until <= now())
                ORDER BY next_attempt_at, notification_id
                LIMIT 1 FOR UPDATE SKIP LOCKED
            )
            UPDATE danger_email_outbox AS delivery
            SET status = 'SENDING', attempt_count = attempt_count + 1,
                lease_until = now() + interval '2 minutes', claim_token = :token
            FROM candidate
            WHERE delivery.notification_id = candidate.notification_id
            RETURNING delivery.notification_id, attempt_count, recipient, subject, plain_text, html
            """)
            .param("token", token)
            .query((rs, row) -> new Claim(
                rs.getLong("notification_id"), token, rs.getInt("attempt_count"),
                new DangerEmail(rs.getString("recipient"), rs.getString("subject"),
                    rs.getString("plain_text"), rs.getString("html"))
            ))
            .optional();
    }

    @Transactional
    public boolean markSent(Claim claim) {
        return jdbc.sql("""
            UPDATE danger_email_outbox
            SET status = 'SENT', sent_at = now(), lease_until = NULL, claim_token = NULL, last_error = NULL
            WHERE notification_id = :id AND status = 'SENDING' AND claim_token = :token
            """)
            .param("id", claim.notificationId())
            .param("token", claim.token())
            .update() == 1;
    }

    @Transactional
    public boolean markFailed(Claim claim, String error) {
        boolean retry = claim.attempt() < MAX_ATTEMPTS;
        long delaySeconds = 5L << (Math.min(claim.attempt(), MAX_ATTEMPTS) - 1);
        return jdbc.sql("""
            UPDATE danger_email_outbox
            SET status = :status, next_attempt_at = now() + :delay * interval '1 second',
                lease_until = NULL, claim_token = NULL, last_error = :error
            WHERE notification_id = :id AND status = 'SENDING' AND claim_token = :token
            """)
            .param("status", retry ? "PENDING" : "FAILED")
            .param("delay", delaySeconds)
            .param("error", error)
            .param("id", claim.notificationId())
            .param("token", claim.token())
            .update() == 1;
    }

    public record Claim(Long notificationId, String token, int attempt, DangerEmail email) {}
}
