package com.kumohcse.tracelog.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.kumohcse.tracelog.domain.Product;
import com.kumohcse.tracelog.domain.Review;
import com.kumohcse.tracelog.domain.User;
import com.kumohcse.tracelog.dto.product.CreateReviewRequest;
import com.kumohcse.tracelog.dto.product.ProductDetailResponse;
import com.kumohcse.tracelog.dto.product.ProductSalesResponse;
import com.kumohcse.tracelog.dto.product.ProductSummaryResponse;
import com.kumohcse.tracelog.dto.product.ReviewResponse;
import com.kumohcse.tracelog.repository.OrderItemRepository;
import com.kumohcse.tracelog.repository.ProductRepository;
import com.kumohcse.tracelog.repository.ReviewRepository;
import com.kumohcse.tracelog.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;
    private final ShopMapper shopMapper;

    public List<ProductSummaryResponse> getProducts() {
        return productRepository.findAllWithDetailsOrderByCreatedAtDesc().stream()
            .map(shopMapper::toProductSummary)
            .toList();
    }

    public List<ProductSalesResponse> getPublicSales() {
        return orderItemRepository.findPublicSales();
    }

    public ProductDetailResponse getProductDetail(Long productId) {
        return shopMapper.toProductDetail(getProduct(productId));
    }

    public List<ReviewResponse> getProductReviews(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "상품을 찾을 수 없습니다.");
        }
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
            .map(shopMapper::toReviewResponse)
            .toList();
    }

    @Transactional
    public ReviewResponse createReview(Long productId, Long userId, CreateReviewRequest request) {
        Product product = getProduct(productId);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."));

        boolean exists = reviewRepository.existsByProductIdAndUserIdAndSizeValue(productId, userId, request.size());
        if (exists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 해당 상품 리뷰를 작성했습니다.");
        }

        Review savedReview = reviewRepository.save(
            Review.create(user, product, request.title(), request.rating(), request.content(), request.size())
        );
        return shopMapper.toReviewResponse(savedReview);
    }

    public Product getProduct(Long productId) {
        return productRepository.findDetailById(productId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "상품을 찾을 수 없습니다."));
    }
}
