package com.kumohcse.tracelog.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.kumohcse.tracelog.domain.Notification;
import com.kumohcse.tracelog.domain.Session;
import com.kumohcse.tracelog.domain.User;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @EntityGraph(attributePaths = {"session"})
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserIdAndReadFalse(Long userId);

    boolean existsByUserAndSessionAndNotificationType(User user, Session session, String notificationType);

    List<Notification> findByUserIdAndReadFalse(Long userId);

    Optional<Notification> findByIdAndUserId(Long id, Long userId);
}
