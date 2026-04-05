package com.kumohcse.tracelog.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.kumohcse.tracelog.domain.Cart;
import com.kumohcse.tracelog.domain.CartItem;
import com.kumohcse.tracelog.domain.Product;
import com.kumohcse.tracelog.domain.User;
import com.kumohcse.tracelog.dto.cart.AddCartItemRequest;
import com.kumohcse.tracelog.dto.cart.CartResponse;
import com.kumohcse.tracelog.dto.cart.UpdateCartItemQuantityRequest;
import com.kumohcse.tracelog.repository.CartRepository;
import com.kumohcse.tracelog.repository.ProductRepository;
import com.kumohcse.tracelog.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ShopMapper shopMapper;

    public CartResponse getCart(Long userId) {
        return new CartResponse(
            cartRepository.findByUserId(userId)
                .map(cart -> cart.getItems().stream().map(shopMapper::toCartItemResponse).toList())
                .orElse(List.of())
        );
    }

    @Transactional
    public String addToCart(Long userId, AddCartItemRequest request) {
        Product product = productRepository.findDetailById(request.productId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "상품을 찾을 수 없습니다."));

        if (!product.supportsSize(request.size())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "해당 사이즈는 주문할 수 없습니다.");
        }

        Cart cart = cartRepository.findByUserId(userId)
            .orElseGet(() -> cartRepository.save(Cart.create(getUser(userId))));
        cart.addItem(product, request.size(), request.quantity());
        return "장바구니에 담겼습니다.";
    }

    @Transactional
    public String updateCartItem(Long userId, Long itemId, UpdateCartItemQuantityRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "장바구니가 없습니다."));

        CartItem item = cart.findItem(itemId);
        if (item == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "장바구니 항목을 찾을 수 없습니다.");
        }
        item.updateQuantity(request.quantity());
        return "수량을 수정했습니다.";
    }

    @Transactional
    public String removeCartItem(Long userId, Long itemId) {
        Cart cart = cartRepository.findByUserId(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "장바구니가 없습니다."));

        int before = cart.getItems().size();
        cart.removeItem(itemId);
        if (before == cart.getItems().size()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "장바구니 항목을 찾을 수 없습니다.");
        }
        return "항목을 삭제했습니다.";
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."));
    }
}
