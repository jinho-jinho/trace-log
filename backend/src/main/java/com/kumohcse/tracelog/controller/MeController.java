package com.kumohcse.tracelog.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kumohcse.tracelog.dto.order.OrderResponse;
import com.kumohcse.tracelog.service.AuthService;
import com.kumohcse.tracelog.service.OrderService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeController {

    private final OrderService orderService;
    private final AuthService authService;

    @GetMapping("/orders")
    public List<OrderResponse> getMyOrders(HttpServletRequest request) {
        return orderService.getMyOrders(authService.getSessionUser(request).id());
    }
}
