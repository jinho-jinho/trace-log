package com.kumohcse.tracelog.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kumohcse.tracelog.dto.auth.AuthResponse;
import com.kumohcse.tracelog.dto.auth.CurrentUserResponse;
import com.kumohcse.tracelog.dto.auth.LoginRequest;
import com.kumohcse.tracelog.dto.auth.RegisterRequest;
import com.kumohcse.tracelog.dto.common.MessageResponse;
import com.kumohcse.tracelog.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpServletRequest) {
        return authService.register(request, httpServletRequest);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpServletRequest) {
        return authService.login(request, httpServletRequest);
    }

    @GetMapping("/me")
    public CurrentUserResponse me(HttpServletRequest httpServletRequest) {
        return new CurrentUserResponse(authService.getCurrentUser(httpServletRequest));
    }

    @PostMapping("/logout")
    public MessageResponse logout(HttpServletRequest httpServletRequest) {
        return new MessageResponse(authService.logout(httpServletRequest));
    }
}
