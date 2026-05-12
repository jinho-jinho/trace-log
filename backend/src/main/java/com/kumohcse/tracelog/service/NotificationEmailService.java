package com.kumohcse.tracelog.service;

import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import com.kumohcse.tracelog.domain.Notification;
import com.kumohcse.tracelog.domain.Session;
import com.kumohcse.tracelog.domain.User;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationEmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public void sendDangerNotification(User recipient, Session session, Notification notification) {
        if (fromEmail == null || fromEmail.isBlank()) {
            log.info("Skip danger notification email because spring.mail.username is not configured.");
            return;
        }
        if (recipient.getEmail() == null || recipient.getEmail().isBlank()) {
            log.info("Skip danger notification email because recipient email is empty. userId={}", recipient.getId());
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                message,
                MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                StandardCharsets.UTF_8.name()
            );
            helper.setFrom(fromEmail);
            helper.setTo(recipient.getEmail());
            helper.setSubject("[TraceLog] 위험 세션 감지 - session " + session.getId());
            helper.setText(buildPlainText(session, notification), buildHtml(session, notification));
            mailSender.send(message);
        } catch (MailException | MessagingException e) {
            log.warn(
                "Failed to send danger notification email. userId={}, sessionId={}",
                recipient.getId(),
                session.getId(),
                e
            );
        }
    }

    private String buildHtml(Session session, Notification notification) {
        Context context = new Context();
        context.setVariable("sessionId", session.getId());
        context.setVariable("ip", session.getIp());
        context.setVariable("userAgent", session.getUserAgent());
        context.setVariable("anomalyScore", session.getAnomalyScore());
        context.setVariable("scoreGap", notification.getScoreGap());
        context.setVariable("message", notification.getMessage());
        context.setVariable("sessionStart", session.getSessionStart());
        context.setVariable("sessionEnd", session.getSessionEnd());
        context.setVariable("requestCount", session.getRequestCount());
        return templateEngine.process("mail/danger-session-alert", context);
    }

    private String buildPlainText(Session session, Notification notification) {
        return """
            [TraceLog] 위험 세션 감지

            세션 ID: %s
            IP: %s
            User-Agent: %s
            요청 수: %s
            세션 시간: %s ~ %s
            이상 점수: %s
            점수 차이: %s

            %s
            """.formatted(
            session.getId(),
            session.getIp(),
            session.getUserAgent(),
            session.getRequestCount(),
            session.getSessionStart(),
            session.getSessionEnd(),
            session.getAnomalyScore(),
            notification.getScoreGap(),
            notification.getMessage()
        );
    }
}
