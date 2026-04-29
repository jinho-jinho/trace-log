package com.kumohcse.tracelog.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kumohcse.tracelog.domain.DetectionSetting;

public interface DetectionSettingRepository extends JpaRepository<DetectionSetting, Long> {

    Optional<DetectionSetting> findTopByOrderByAppliedAtDesc();
}
