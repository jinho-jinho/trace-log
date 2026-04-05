package com.kumohcse.tracelog.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kumohcse.tracelog.domain.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
