package com.kumohcse.tracelog.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.InterruptedIOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mock.http.client.MockClientHttpResponse;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.client.RestClient;

import com.kumohcse.tracelog.TracelogApplication;
import com.kumohcse.tracelog.dto.session.PipelineSessionImportRequest;
import com.zaxxer.hikari.HikariDataSource;

import jakarta.mail.internet.MimeMessage;

@EnabledIfEnvironmentVariable(named = "TRACELOG_BOUNDARY_MODE", matches = "measure")
class ExternalCallBenchmarkTest extends ExternalCallTestSupport {

    @Test
    void measureServiceEntryPoints() {
        int samples = Integer.parseInt(System.getenv().getOrDefault("TRACELOG_BOUNDARY_SAMPLES", "30"));
        stubs.delayMs = Integer.parseInt(System.getenv().getOrDefault("TRACELOG_BOUNDARY_DELAY_MS", "400"));
        assertThat(samples).isPositive();
        assertThat(stubs.delayMs).isPositive();

        Long llmSessionId = pipeline.importSession(request(false)).sessionId();
        for (int i = 0; i < 3; i++) {
            receiveDanger();
            llm.analyze(llmSessionId);
        }

        int mailBefore = stubs.smtpCalls.get();
        List<Long> importTimes = new ArrayList<>();
        List<Long> llmTimes = new ArrayList<>();
        List<Integer> activeConnections = new ArrayList<>();
        int llmCallsInTransaction = 0;
        for (int i = 0; i < samples; i++) {
            long start = System.nanoTime();
            receiveDanger();
            importTimes.add(System.nanoTime() - start);

            start = System.nanoTime();
            llm.analyze(llmSessionId);
            llmTimes.add(System.nanoTime() - start);
            activeConnections.add(stubs.activeDuringLlm.get());
            if (stubs.llmInTransaction.get()) {
                llmCallsInTransaction++;
            }
        }

        System.out.printf(Locale.ROOT,
            "TRACELOG_BOUNDARY samples=%d fake_delay_ms=%d import_service_p95_ms=%.2f "
                + "smtp_calls_in_import=%d llm_service_p95_ms=%.2f llm_calls_in_tx=%d "
                + "llm_wait_active_db_min=%d llm_wait_active_db_max=%d%n",
            samples, stubs.delayMs, p95Millis(importTimes), stubs.smtpCalls.get() - mailBefore,
            p95Millis(llmTimes), llmCallsInTransaction,
            activeConnections.stream().mapToInt(Integer::intValue).min().orElseThrow(),
            activeConnections.stream().mapToInt(Integer::intValue).max().orElseThrow());
    }

    private void receiveDanger() {
        assertThat(pipeline.importSession(request(true)).notificationCreated()).isTrue();
    }

    private static double p95Millis(List<Long> samples) {
        samples.sort(Long::compareTo);
        return samples.get((int) Math.ceil(samples.size() * 0.95) - 1) / 1_000_000.0;
    }
}

@SpringBootTest(classes = {TracelogApplication.class, ExternalCallTestSupport.StubConfig.class}, properties = {
    "spring.datasource.url=${TRACELOG_BOUNDARY_DB_URL}",
    "spring.datasource.username=${TRACELOG_BOUNDARY_DB_USER}",
    "spring.datasource.password=${TRACELOG_BOUNDARY_DB_PASSWORD:}",
    "spring.jpa.hibernate.ddl-auto=update",
    "spring.mail.username=tracelog-test@example.invalid",
    "app.gemini.api-key=local-stub",
    "app.danger-email.worker-enabled=false"
})
abstract class ExternalCallTestSupport {

    @Autowired JdbcClient jdbc;
    @Autowired PipelineSessionImportService pipeline;
    @Autowired SessionLlmAnalysisService llm;
    @Autowired ExternalStubs stubs;

    @BeforeEach
    void seedAdminAndDetectionSetting() {
        jdbc.sql("""
            INSERT INTO users (email, password_hash, role)
            VALUES ('boundary-admin@example.invalid', 'stub', 'admin') ON CONFLICT (email) DO NOTHING
            """).update();
        jdbc.sql("""
            INSERT INTO detection_settings (threshold_value, min_request_count, danger_score_gap)
            VALUES (0.5, 1, 0.1)
            """).update();
        stubs.reset();
    }

    PipelineSessionImportRequest request(boolean danger) {
        String id = UUID.randomUUID().toString();
        LocalDateTime start = LocalDateTime.of(2026, 1, 1, 0, 0);
        return new PipelineSessionImportRequest(id, "192.0.2.10", "boundary-test/" + id,
            start, start.plusSeconds(10), BigDecimal.TEN, 10,
            new BigDecimal(danger ? "0.95" : "0.10"), start.plusSeconds(10), null, null, null);
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class StubConfig {

        @Bean
        ExternalStubs externalStubs(HikariDataSource dataSource) {
            return new ExternalStubs(dataSource);
        }

        @Bean
        @Primary
        JavaMailSender stubMailSender(ExternalStubs stubs) {
            JavaMailSender sender = mock(JavaMailSender.class);
            JavaMailSenderImpl mimeFactory = new JavaMailSenderImpl();
            when(sender.createMimeMessage()).thenAnswer(invocation -> mimeFactory.createMimeMessage());
            doAnswer(invocation -> {
                stubs.smtpCalls.incrementAndGet();
                stubs.smtpInTransaction.set(TransactionSynchronizationManager.isActualTransactionActive());
                stubs.pause(stubs.delayMs);
                if (stubs.failSmtp.get()) {
                    throw new MailSendException("Simulated SMTP failure");
                }
                return null;
            }).when(sender).send(any(MimeMessage.class));
            return sender;
        }

        @Bean
        @Primary
        RestClient.Builder stubGemini(ExternalStubs stubs) {
            return RestClient.builder().requestInterceptor((request, body, execution) -> {
                stubs.pause(stubs.delayMs / 2);
                stubs.llmInTransaction.set(TransactionSynchronizationManager.isActualTransactionActive());
                stubs.activeDuringLlm.set(stubs.dataSource.getHikariPoolMXBean().getActiveConnections());
                CountDownLatch release = stubs.llmRelease;
                stubs.llmEntered.countDown();
                stubs.awaitResponse(release);
                stubs.pause(stubs.delayMs - stubs.delayMs / 2);
                String json = "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"{\\\"summary\\\":\\\"stub\\\"}\"}]}}]}";
                return new MockClientHttpResponse(json.getBytes(StandardCharsets.UTF_8), HttpStatus.OK);
            });
        }
    }

    static class ExternalStubs {

        final HikariDataSource dataSource;
        final AtomicInteger smtpCalls = new AtomicInteger();
        final AtomicInteger activeDuringLlm = new AtomicInteger();
        final AtomicBoolean smtpInTransaction = new AtomicBoolean();
        final AtomicBoolean llmInTransaction = new AtomicBoolean();
        final AtomicBoolean failSmtp = new AtomicBoolean();
        volatile int delayMs;
        volatile CountDownLatch llmEntered;
        volatile CountDownLatch llmRelease;

        ExternalStubs(HikariDataSource dataSource) {
            this.dataSource = dataSource;
            reset();
        }

        void reset() {
            delayMs = 0;
            smtpCalls.set(0);
            activeDuringLlm.set(0);
            smtpInTransaction.set(false);
            llmInTransaction.set(false);
            failSmtp.set(false);
            llmEntered = new CountDownLatch(0);
            llmRelease = new CountDownLatch(0);
        }

        void awaitResponse(CountDownLatch release) throws InterruptedIOException {
            try {
                if (!release.await(10, TimeUnit.SECONDS)) {
                    throw new IllegalStateException("Test did not release the Gemini response");
                }
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                throw new InterruptedIOException("Interrupted Gemini stub");
            }
        }

        void pause(long millis) throws InterruptedIOException {
            try {
                Thread.sleep(millis);
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                throw new InterruptedIOException("Interrupted external call stub");
            }
        }
    }
}
