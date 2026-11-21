package com.kumohcse.tracelog.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

@EnabledIfEnvironmentVariable(named = "TRACELOG_BOUNDARY_MODE", matches = "verify")
class ExternalCallIsolationTest extends ExternalCallTestSupport {

    @Autowired DangerEmailOutbox outbox;
    @Autowired NotificationEmailService sender;
    @Autowired PlatformTransactionManager transactionManager;

    @Test
    void mailRollsBackWithImportAndRetriesOutsideTheTransaction() {
        assertThat(outbox.claimNext()).isEmpty();
        long rolledBackSession = new TransactionTemplate(transactionManager).execute(status -> {
            long sessionId = pipeline.importSession(request(true)).sessionId();
            status.setRollbackOnly();
            return sessionId;
        });
        assertThat(jdbc.sql("SELECT id FROM sessions WHERE id = :id").param("id", rolledBackSession)
            .query(Long.class).optional()).isEmpty();
        assertThat(outbox.claimNext()).isEmpty();
        assertThat(stubs.smtpCalls.get()).isZero();

        long importedSession = pipeline.importSession(request(true)).sessionId();
        long notificationId = jdbc.sql("SELECT id FROM notifications WHERE session_id = :id")
            .param("id", importedSession).query(Long.class).single();
        assertThat(mailStatus(notificationId)).isEqualTo("PENDING");
        assertThat(stubs.smtpCalls.get()).isZero();

        DangerEmailWorker worker = new DangerEmailWorker(outbox, sender);
        stubs.failSmtp.set(true);
        worker.deliverPending();
        assertThat(mailStatus(notificationId)).isEqualTo("PENDING");
        assertThat(outbox.claimNext()).isEmpty();
        assertThat(stubs.smtpInTransaction.get()).isFalse();
        assertThat(stubs.smtpCalls.get()).isEqualTo(1);

        jdbc.sql("UPDATE danger_email_outbox SET next_attempt_at = now() WHERE notification_id = :id")
            .param("id", notificationId).update();
        DangerEmailOutbox.Claim abandonedClaim = outbox.claimNext().orElseThrow();
        assertThat(outbox.claimNext()).isEmpty();
        jdbc.sql("UPDATE danger_email_outbox SET lease_until = now() WHERE notification_id = :id")
            .param("id", notificationId).update();

        stubs.failSmtp.set(false);
        new DangerEmailWorker(outbox, sender).deliverPending();
        assertThat(mailStatus(notificationId)).isEqualTo("SENT");
        assertThat(stubs.smtpCalls.get()).isEqualTo(2);
        assertThat(stubs.smtpInTransaction.get()).isFalse();
        assertThat(outbox.markSent(abandonedClaim)).isFalse();
    }

    @Test
    void llmWaitReleasesConnectionAndRejectsResultsForChangedEvidence() throws Exception {
        var input = request(false);
        long sessionId = pipeline.importSession(input).sessionId();
        stubs.llmEntered = new CountDownLatch(1);
        stubs.llmRelease = new CountDownLatch(1);
        var pending = CompletableFuture.supplyAsync(() -> llm.analyze(sessionId));

        try {
            assertThat(stubs.llmEntered.await(8, TimeUnit.SECONDS)).isTrue();
            assertThat(stubs.llmInTransaction.get()).isFalse();
            assertThat(stubs.activeDuringLlm.get()).isZero();
            assertThat(pipeline.importSession(input).sessionId()).isEqualTo(sessionId);
        } finally {
            stubs.llmRelease.countDown();
        }

        assertThatThrownBy(() -> pending.get(8, TimeUnit.SECONDS))
            .hasCauseInstanceOf(ResponseStatusException.class)
            .satisfies(ex -> assertThat(((ResponseStatusException) ex.getCause()).getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT));
        assertThat(jdbc.sql("SELECT session_id FROM session_llm_summaries WHERE session_id = :id")
            .param("id", sessionId).query(Long.class).optional()).isEmpty();
        assertThat(llm.analyze(sessionId).sessionId()).isEqualTo(sessionId);
    }

    private String mailStatus(long notificationId) {
        return jdbc.sql("SELECT status FROM danger_email_outbox WHERE notification_id = :id")
            .param("id", notificationId).query(String.class).single();
    }
}
