package com.kumohcse.tracelog.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.kumohcse.tracelog.domain.Cart;
import com.kumohcse.tracelog.domain.CartItem;
import com.kumohcse.tracelog.domain.OrderEntity;
import com.kumohcse.tracelog.domain.Product;
import com.kumohcse.tracelog.domain.User;
import com.kumohcse.tracelog.dto.order.CheckoutResponse;
import com.kumohcse.tracelog.dto.order.OrderResponse;
import com.kumohcse.tracelog.repository.CartRepository;
import com.kumohcse.tracelog.repository.OrderRepository;
import com.kumohcse.tracelog.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ShopMapper shopMapper;

    @Transactional
    public CheckoutResponse checkout(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "장바구니가 비어 있습니다."));

        if (cart.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "장바구니가 비어 있습니다.");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."));

        BigDecimal totalAmount = BigDecimal.ZERO;
        OrderEntity order = OrderEntity.create(user, BigDecimal.ZERO, LocalDateTime.now());

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            if (!product.supportsSize(cartItem.getSizeValue())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    product.getName() + "의 해당 사이즈는 주문할 수 없습니다.");
            }

            BigDecimal priceSnapshot = product.calculateFinalPrice();
            order.addItem(product, product.getName(), priceSnapshot, cartItem.getSizeValue(), cartItem.getQuantity());
            totalAmount = totalAmount.add(priceSnapshot.multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            product.increaseTotalSold(cartItem.getQuantity());
        }

        order.updateTotalAmount(totalAmount);
        OrderEntity persistedOrder = orderRepository.save(order);
        cart.clearItems();

        return new CheckoutResponse("주문이 완료되었습니다.", shopMapper.toOrderResponse(persistedOrder));
    }

    public List<OrderResponse> getMyOrders(Long userId) {
        return orderRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(shopMapper::toOrderResponse)
            .toList();
    }
}
