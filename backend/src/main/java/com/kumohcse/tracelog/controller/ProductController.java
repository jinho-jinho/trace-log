package com.kumohcse.tracelog.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kumohcse.tracelog.dto.product.CreateReviewRequest;
import com.kumohcse.tracelog.dto.product.ProductDetailResponse;
import com.kumohcse.tracelog.dto.product.ProductSalesResponse;
import com.kumohcse.tracelog.dto.product.ProductSummaryResponse;
import com.kumohcse.tracelog.dto.product.ReviewResponse;
import com.kumohcse.tracelog.service.AuthService;
import com.kumohcse.tracelog.service.ProductService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final AuthService authService;

    @GetMapping
    public List<ProductSummaryResponse> getProducts() {
        return productService.getProducts();
    }

    @GetMapping("/sales")
    public List<ProductSalesResponse> getSales() {
        return productService.getPublicSales();
    }

    @GetMapping("/{productId}")
    public ProductDetailResponse getProduct(@PathVariable Long productId) {
        return productService.getProductDetail(productId);
    }

    @GetMapping("/{productId}/reviews")
    public List<ReviewResponse> getReviews(@PathVariable Long productId) {
        return productService.getProductReviews(productId);
    }

    @PostMapping("/{productId}/reviews")
    public ReviewResponse createReview(
        @PathVariable Long productId,
        @Valid @RequestBody CreateReviewRequest request,
        HttpServletRequest httpServletRequest
    ) {
        return productService.createReview(productId, authService.getSessionUser(httpServletRequest).id(), request);
    }
}
