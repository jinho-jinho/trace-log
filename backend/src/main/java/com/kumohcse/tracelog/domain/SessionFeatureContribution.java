package com.kumohcse.tracelog.domain;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
    name = "session_feature_contributions",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_session_feature_contributions_session_feature",
        columnNames = {"session_id", "feature_name"}
    )
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SessionFeatureContribution extends BaseCreatedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "contribution_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @Column(name = "feature_name", nullable = false, length = 100)
    private String featureName;

    @Column(name = "feature_value", precision = 20, scale = 8)
    private BigDecimal featureValue;

    @Column(name = "shap_value", nullable = false, precision = 20, scale = 8)
    private BigDecimal shapValue;

    @Column(name = "abs_shap_value", nullable = false, precision = 20, scale = 8)
    private BigDecimal absShapValue;

    public static SessionFeatureContribution create(
        String featureName,
        BigDecimal featureValue,
        BigDecimal shapValue,
        BigDecimal absShapValue
    ) {
        SessionFeatureContribution contribution = new SessionFeatureContribution();
        contribution.featureName = featureName;
        contribution.featureValue = featureValue;
        contribution.shapValue = shapValue;
        contribution.absShapValue = absShapValue == null && shapValue != null ? shapValue.abs() : absShapValue;
        return contribution;
    }

    void assignSession(Session session) {
        this.session = session;
    }
}
