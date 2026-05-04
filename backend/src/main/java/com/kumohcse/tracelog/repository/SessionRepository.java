package com.kumohcse.tracelog.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import com.kumohcse.tracelog.domain.Session;

public interface SessionRepository extends JpaRepository<Session, Long>, JpaSpecificationExecutor<Session> {

    @Override
    @EntityGraph(attributePaths = {"llmSummary"})
    List<Session> findAll(Specification<Session> spec, Sort sort);

    @EntityGraph(attributePaths = {"requestLogs", "feature", "llmSummary", "featureContributions"})
    @Query("""
        select distinct s
        from Session s
        left join fetch s.requestLogs
        left join fetch s.feature
        left join fetch s.llmSummary
        left join fetch s.featureContributions
        where s.id = :id
        """)
    Optional<Session> findDetailById(Long id);

    @EntityGraph(attributePaths = {"requestLogs", "feature", "featureContributions"})
    Optional<Session> findByIpAndUserAgentAndSessionStartAndSessionEnd(
        String ip,
        String userAgent,
        LocalDateTime sessionStart,
        LocalDateTime sessionEnd
    );

    @EntityGraph(attributePaths = {"llmSummary"})
    List<Session> findBySessionStartGreaterThanEqualAndAnomalyScoreGreaterThanEqualOrderBySessionStartDesc(
        LocalDateTime sessionStart,
        BigDecimal anomalyScore,
        Pageable pageable
    );

    @EntityGraph(attributePaths = {"llmSummary"})
    List<Session> findBySessionStartGreaterThanEqualAndAnomalyScoreGreaterThanEqualOrderByAnomalyScoreDescSessionStartDesc(
        LocalDateTime sessionStart,
        BigDecimal anomalyScore,
        Pageable pageable
    );

    @Query("""
        select s
        from Session s
        where s.sessionStart >= :startAt
        order by s.sessionStart asc
        """)
    List<Session> findAllStartedAfterOrderBySessionStartAsc(LocalDateTime startAt);
}
