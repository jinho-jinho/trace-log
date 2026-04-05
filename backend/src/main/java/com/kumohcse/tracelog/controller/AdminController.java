package com.kumohcse.tracelog.controller;

import static org.springframework.http.HttpStatus.FORBIDDEN;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.kumohcse.tracelog.domain.UserRole;
import com.kumohcse.tracelog.dto.product.AdminSalesResponse;
import com.kumohcse.tracelog.dto.product.ProductSummaryResponse;
import com.kumohcse.tracelog.service.AdminProductService;
import com.kumohcse.tracelog.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class AdminController {

    private final AdminProductService adminProductService;
    private final AuthService authService;

    @GetMapping("/api/admin/products")
    public List<ProductSummaryResponse> getAdminProducts(HttpServletRequest request) {
        requireAdmin(request);
        return adminProductService.getProducts();
    }

    @PostMapping(path = {"/api/admin/products", "/api/products"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProductSummaryResponse createProduct(
        @RequestParam String name,
        @RequestParam(required = false) String shortDescription,
        @RequestParam(required = false) BigDecimal basePrice,
        @RequestParam(required = false) BigDecimal discountRate,
        @RequestParam(required = false) String saleStart,
        @RequestParam(required = false) String saleEnd,
        @RequestParam(required = false) String categories,
        @RequestParam(required = false) String materials,
        @RequestParam(required = false) String availableSizes,
        @RequestParam("images") List<MultipartFile> images,
        HttpServletRequest request
    ) {
        requireAdmin(request);
        return adminProductService.createProduct(
            name,
            shortDescription,
            basePrice,
            discountRate,
            parseDateTime(saleStart),
            parseDateTime(saleEnd),
            parseStringList(categories),
            parseStringList(materials),
            parseIntegerList(availableSizes),
            images
        );
    }

    @PatchMapping({"/api/admin/products/{productId}/sizes", "/api/products/{productId}/sizes"})
    public ProductSummaryResponse updateProductSizes(
        @PathVariable Long productId,
        @RequestBody(required = false) Map<String, Object> body,
        HttpServletRequest request
    ) {
        requireAdmin(request);
        Object raw = body == null ? null : body.get("availableSizes");
        List<Integer> sizes = raw instanceof List<?> list
            ? list.stream().map(value -> Integer.parseInt(String.valueOf(value))).toList()
            : List.of();
        return adminProductService.updateProductSizes(productId, sizes);
    }

    @PatchMapping({"/api/admin/products/{productId}/discount", "/api/products/{productId}/discount"})
    public ProductSummaryResponse updateProductDiscount(
        @PathVariable Long productId,
        @RequestBody(required = false) Map<String, Object> body,
        HttpServletRequest request
    ) {
        requireAdmin(request);
        BigDecimal discountRate = body != null && body.get("discountRate") != null
            ? new BigDecimal(String.valueOf(body.get("discountRate")))
            : BigDecimal.ZERO;
        LocalDateTime saleStart = body != null ? parseDateTime((String) body.get("saleStart")) : null;
        LocalDateTime saleEnd = body != null ? parseDateTime((String) body.get("saleEnd")) : null;
        return adminProductService.updateProductDiscount(productId, discountRate, saleStart, saleEnd);
    }

    @GetMapping("/api/admin/sales")
    public List<AdminSalesResponse> getSales(
        @RequestParam(required = false) String start,
        @RequestParam(required = false) String end,
        HttpServletRequest request
    ) {
        requireAdmin(request);
        LocalDateTime startDateTime = start == null || start.isBlank() ? null : LocalDate.parse(start).atStartOfDay();
        LocalDateTime endDateTime = end == null || end.isBlank() ? null : LocalDate.parse(end).atTime(LocalTime.MAX);
        return adminProductService.getSales(startDateTime, endDateTime);
    }

    private void requireAdmin(HttpServletRequest request) {
        if (authService.getSessionUser(request).role() != UserRole.ADMIN) {
            throw new ResponseStatusException(FORBIDDEN, "관리자 권한이 필요합니다.");
        }
    }

    private List<String> parseStringList(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        String trimmed = raw.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            trimmed = trimmed.substring(1, trimmed.length() - 1);
        }
        return Arrays.stream(trimmed.split(","))
            .map(String::trim)
            .map(value -> value.replace("\"", ""))
            .filter(value -> !value.isBlank())
            .toList();
    }

    private List<Integer> parseIntegerList(String raw) {
        return parseStringList(raw).stream()
            .map(Integer::parseInt)
            .distinct()
            .sorted()
            .toList();
    }

    private LocalDateTime parseDateTime(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        if (raw.length() == 10) {
            return LocalDate.parse(raw).atStartOfDay();
        }
        return LocalDateTime.parse(raw);
    }
}
