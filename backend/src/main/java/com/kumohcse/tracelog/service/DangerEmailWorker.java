package com.kumohcse.tracelog.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.MailException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.kumohcse.tracelog.service.DangerEmailOutbox.Claim;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.danger-email.worker-enabled", matchIfMissing = true)
public class DangerEmailWorker {

    private final DangerEmailOutbox outbox;
    private final NotificationEmailService sender;

    @Scheduled(fixedDelayString = "${app.danger-email.poll-interval-ms:1000}")
    void deliverPending() {
        if (!sender.isConfigured()) {
            return;
        }
        for (int i = 0; i < 16; i++) {
            var next = outbox.claimNext();
            if (next.isEmpty()) {
                return;
            }
            deliver(next.get());
        }
    }

    private void deliver(Claim claim) {
        try {
            sender.send(claim.email());
        } catch (MailException | MessagingException ex) {
            boolean recorded = outbox.markFailed(claim, ex.getClass().getSimpleName());
            log.warn("Danger email send failed: notificationId={}, attempt={}, error={}, recorded={}",
                claim.notificationId(), claim.attempt(), ex.getClass().getSimpleName(), recorded);
            return;
        }
        if (!outbox.markSent(claim)) {
            log.warn("Danger email sent after its claim was replaced: notificationId={}", claim.notificationId());
        }
    }
}
