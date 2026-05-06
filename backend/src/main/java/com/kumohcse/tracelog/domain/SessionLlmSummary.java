package com.kumohcse.tracelog.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "session_llm_summaries")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SessionLlmSummary extends BaseCreatedEntity {

    @Id
    @Column(name = "session_id")
    private Long id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @Column(name = "summary_text", nullable = false, columnDefinition = "TEXT")
    private String summaryText;

    public static SessionLlmSummary create(Session session, String summaryText) {
        SessionLlmSummary summary = new SessionLlmSummary();
        summary.session = session;
        summary.id = session.getId();
        summary.summaryText = summaryText;
        return summary;
    }

    public void updateSummaryText(String summaryText) {
        this.summaryText = summaryText;
    }
}
