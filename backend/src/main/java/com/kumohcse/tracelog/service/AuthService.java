package com.kumohcse.tracelog.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.kumohcse.tracelog.domain.User;
import com.kumohcse.tracelog.dto.auth.AuthResponse;
import com.kumohcse.tracelog.dto.auth.AuthUserResponse;
import com.kumohcse.tracelog.dto.auth.LoginRequest;
import com.kumohcse.tracelog.dto.auth.RegisterRequest;
import com.kumohcse.tracelog.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    public static final String LOGIN_USER_SESSION_KEY = "LOGIN_USER";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse register(RegisterRequest request, HttpServletRequest httpServletRequest) {
        String normalizedEmail = normalizeEmail(request.email());

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 가입된 이메일입니다.");
        }

        User user = User.create(
            normalizedEmail,
            passwordEncoder.encode(request.password()),
            normalizeName(request.name())
        );
        User savedUser = userRepository.save(user);

        AuthSessionUser sessionUser = toSessionUser(savedUser);
        HttpSession session = httpServletRequest.getSession(true);
        session.setAttribute(LOGIN_USER_SESSION_KEY, sessionUser);

        return new AuthResponse("회원가입 성공", sessionUser.toResponse());
    }

    public AuthResponse login(LoginRequest request, HttpServletRequest httpServletRequest) {
        String normalizedEmail = normalizeEmail(request.email());

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                "이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                "이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        AuthSessionUser sessionUser = toSessionUser(user);
        HttpSession session = httpServletRequest.getSession(true);
        session.setAttribute(LOGIN_USER_SESSION_KEY, sessionUser);

        return new AuthResponse("로그인 성공", sessionUser.toResponse());
    }

    public AuthUserResponse getCurrentUser(HttpServletRequest httpServletRequest) {
        return getSessionUser(httpServletRequest).toResponse();
    }

    @Transactional
    public String logout(HttpServletRequest httpServletRequest) {
        HttpSession session = httpServletRequest.getSession(false);
        if (session == null) {
            return "로그아웃 완료";
        }
        session.invalidate();
        return "로그아웃 완료";
    }

    public AuthSessionUser getSessionUser(HttpServletRequest httpServletRequest) {
        HttpSession session = httpServletRequest.getSession(false);
        if (session == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        Object value = session.getAttribute(LOGIN_USER_SESSION_KEY);
        if (value instanceof AuthSessionUser sessionUser) {
            return sessionUser;
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
    }

    private AuthSessionUser toSessionUser(User user) {
        return new AuthSessionUser(user.getId(), user.getEmail(), user.getName(), user.getRole());
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private String normalizeName(String name) {
        if (name == null) {
            return "";
        }
        return name.trim();
    }
}
