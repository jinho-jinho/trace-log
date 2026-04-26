package com.kumohcse.tracelog.controller;

import static org.springframework.http.HttpStatus.FORBIDDEN;

import java.time.LocalDateTime;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.kumohcse.tracelog.domain.UserRole;
import com.kumohcse.tracelog.dto.session.SessionDetailResponse;
import com.kumohcse.tracelog.dto.session.SessionListResponse;
import com.kumohcse.tracelog.dto.session.SessionLogDetailResponse;
import com.kumohcse.tracelog.dto.session.TraceLogDashboardResponse;
import com.kumohcse.tracelog.service.AuthService;
import com.kumohcse.tracelog.service.SessionService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/tracelog")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;
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

    private void requireAdmin(HttpServletRequest request) {
        if (authService.getSessionUser(request).role() != UserRole.ADMIN) {
            throw new ResponseStatusException(FORBIDDEN, "Admin access is required.");
        }
    }
}
