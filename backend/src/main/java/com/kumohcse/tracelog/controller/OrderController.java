package com.kumohcse.tracelog.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kumohcse.tracelog.dto.order.CheckoutResponse;
import com.kumohcse.tracelog.service.AuthService;
import com.kumohcse.tracelog.service.OrderService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final AuthService authService;

    @PostMapping("/checkout")
    public CheckoutResponse checkout(HttpServletRequest request) {
        return orderService.checkout(authService.getSessionUser(request).id());
    }
}
