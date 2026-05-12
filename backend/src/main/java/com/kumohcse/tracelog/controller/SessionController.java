package com.kumohcse.tracelog.controller;

import static org.springframework.http.HttpStatus.FORBIDDEN;

import java.time.LocalDateTime;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.kumohcse.tracelog.domain.UserRole;
import com.kumohcse.tracelog.dto.session.NotificationListResponse;
import com.kumohcse.tracelog.dto.session.SessionAiAnalysisResponse;
import com.kumohcse.tracelog.dto.session.SessionDetailResponse;
import com.kumohcse.tracelog.dto.session.SessionListResponse;
import com.kumohcse.tracelog.dto.session.SessionLogDetailResponse;
import com.kumohcse.tracelog.dto.session.TraceLogDashboardResponse;
import com.kumohcse.tracelog.service.AuthSessionUser;
import com.kumohcse.tracelog.service.AuthService;
import com.kumohcse.tracelog.service.NotificationService;
import com.kumohcse.tracelog.service.SessionLlmAnalysisService;
import com.kumohcse.tracelog.service.SessionService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/tracelog")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;
    private final NotificationService notificationService;
    private final SessionLlmAnalysisService sessionLlmAnalysisService;
    private final AuthService authService;

    @GetMapping("/dashboard")
    public TraceLogDashboardResponse getDashboard(
        @RequestParam(defaultValue = "24h") String range,
        HttpServletRequest request
    ) {
        requireAdmin(request);
        return sessionService.getDashboard(range);
    }

    @GetMapping("/sessions")
    public SessionListResponse getSessions(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startAt,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endAt,
        @RequestParam(required = false) String ip,
        @RequestParam(defaultValue = "latest") String sort,
        HttpServletRequest request
    ) {
        requireAdmin(request);
        return sessionService.getSessions(startAt, endAt, ip, sort);
    }

    @GetMapping("/sessions/{sessionId}")
    public SessionDetailResponse getSessionDetail(
        @PathVariable Long sessionId,
        HttpServletRequest request
    ) {
        requireAdmin(request);
        return sessionService.getSessionDetail(sessionId);
    }

    @GetMapping("/sessions/{sessionId}/logs")
    public SessionLogDetailResponse getSessionLogs(
        @PathVariable Long sessionId,
        @RequestParam(required = false) Integer page,
        @RequestParam(required = false) Integer size,
        HttpServletRequest request
    ) {
        requireAdmin(request);
        return sessionService.getSessionLogDetail(sessionId, page, size);
    }

    @PostMapping("/sessions/{sessionId}/llm-analysis")
    public SessionAiAnalysisResponse analyzeSessionWithLlm(
        @PathVariable Long sessionId,
        HttpServletRequest request
    ) {
        requireAdmin(request);
        return sessionLlmAnalysisService.analyze(sessionId);
    }

    @GetMapping("/notifications")
    public NotificationListResponse getNotifications(HttpServletRequest request) {
        AuthSessionUser sessionUser = requireAdmin(request);
        return notificationService.getNotifications(sessionUser.id());
    }

    @PostMapping("/notifications/read-all")
    public NotificationListResponse markAllNotificationsRead(HttpServletRequest request) {
        AuthSessionUser sessionUser = requireAdmin(request);
        return notificationService.markAllRead(sessionUser.id());
    }

    @PostMapping("/notifications/{notificationId}/read")
    public NotificationListResponse markNotificationRead(
        @PathVariable Long notificationId,
        HttpServletRequest request
    ) {
        AuthSessionUser sessionUser = requireAdmin(request);
        return notificationService.markRead(sessionUser.id(), notificationId);
    }

    private AuthSessionUser requireAdmin(HttpServletRequest request) {
        AuthSessionUser sessionUser = authService.getSessionUser(request);
        if (sessionUser.role() != UserRole.ADMIN) {
            throw new ResponseStatusException(FORBIDDEN, "Admin access is required.");
        }
        return sessionUser;
    }
}
