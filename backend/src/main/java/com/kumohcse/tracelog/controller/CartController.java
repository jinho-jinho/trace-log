package com.kumohcse.tracelog.controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kumohcse.tracelog.dto.cart.AddCartItemRequest;
import com.kumohcse.tracelog.dto.cart.CartResponse;
import com.kumohcse.tracelog.dto.cart.UpdateCartItemQuantityRequest;
import com.kumohcse.tracelog.dto.common.MessageResponse;
import com.kumohcse.tracelog.service.AuthService;
import com.kumohcse.tracelog.service.CartService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final AuthService authService;

    @GetMapping
    public CartResponse getCart(HttpServletRequest request) {
        return cartService.getCart(authService.getSessionUser(request).id());
    }

    @PostMapping("/items")
    public MessageResponse addItem(@Valid @RequestBody AddCartItemRequest request, HttpServletRequest httpServletRequest) {
        return new MessageResponse(cartService.addToCart(authService.getSessionUser(httpServletRequest).id(), request));
    }

    @PatchMapping("/items/{itemId}")
    public MessageResponse updateItem(
        @PathVariable Long itemId,
        @Valid @RequestBody UpdateCartItemQuantityRequest request,
        HttpServletRequest httpServletRequest
    ) {
        return new MessageResponse(cartService.updateCartItem(authService.getSessionUser(httpServletRequest).id(), itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    public MessageResponse deleteItem(@PathVariable Long itemId, HttpServletRequest httpServletRequest) {
        return new MessageResponse(cartService.removeCartItem(authService.getSessionUser(httpServletRequest).id(), itemId));
    }
}
