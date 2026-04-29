package com.kumohcse.tracelog.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.kumohcse.tracelog.domain.SessionRequestLog;

public interface SessionRequestLogRepository extends JpaRepository<SessionRequestLog, Long> {

    List<SessionRequestLog> findBySessionIdOrderBySequenceNoAsc(Long sessionId, Pageable pageable);

    List<SessionRequestLog> findBySessionIdOrderBySequenceNoAsc(Long sessionId);

    long countBySessionId(Long sessionId);
}
