package com.kumohcse.tracelog.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.kumohcse.tracelog.config.StorageProperties;
import com.kumohcse.tracelog.domain.Product;
import com.kumohcse.tracelog.dto.product.AdminSalesResponse;
import com.kumohcse.tracelog.dto.product.ProductSummaryResponse;
import com.kumohcse.tracelog.repository.OrderItemRepository;
import com.kumohcse.tracelog.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminProductService {

    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final ShopMapper shopMapper;
    private final StorageProperties storageProperties;

    public List<ProductSummaryResponse> getProducts() {
        return productRepository.findAllWithDetailsOrderByCreatedAtDesc().stream()
            .map(shopMapper::toProductSummary)
            .toList();
    }

    @Transactional
    public ProductSummaryResponse createProduct(
        String name,
        String shortDescription,
        BigDecimal basePrice,
        BigDecimal discountRate,
        LocalDateTime saleStart,
        LocalDateTime saleEnd,
        List<String> categories,
        List<String> materials,
        List<Integer> availableSizes,
        List<MultipartFile> images
    ) {
        if (images == null || images.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지는 1개 이상 필요합니다.");
        }
        if (availableSizes == null || availableSizes.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "사이즈를 1개 이상 선택해 주세요.");
        }

        Product product = Product.create(
            name.trim(),
            shortDescription == null ? "" : shortDescription,
            basePrice == null ? BigDecimal.ZERO : basePrice,
            discountRate == null ? BigDecimal.ZERO : discountRate,
            saleStart,
            saleEnd
        );
        product.replaceCategories(normalizeStrings(categories));
        product.replaceMaterials(normalizeStrings(materials));
        product.replaceSizes(availableSizes.stream().distinct().sorted().toList());
        product.replaceImages(storeImages(images));

        return shopMapper.toProductSummary(productRepository.save(product));
    }

    @Transactional
    public ProductSummaryResponse updateProductSizes(Long productId, List<Integer> availableSizes) {
        if (availableSizes == null || availableSizes.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "availableSizes는 1개 이상이어야 합니다.");
        }

        Product product = getProduct(productId);
        product.replaceSizes(availableSizes.stream().distinct().sorted().toList());
        return shopMapper.toProductSummary(product);
    }

    @Transactional
    public ProductSummaryResponse updateProductDiscount(
        Long productId,
        BigDecimal discountRate,
        LocalDateTime saleStart,
        LocalDateTime saleEnd
    ) {
        Product product = getProduct(productId);
        product.updateDiscount(discountRate == null ? BigDecimal.ZERO : discountRate, saleStart, saleEnd);
        return shopMapper.toProductSummary(product);
    }

    public List<AdminSalesResponse> getSales(LocalDateTime start, LocalDateTime end) {
        return orderItemRepository.findAdminSales(start, end);
    }

    private Product getProduct(Long productId) {
        return productRepository.findDetailById(productId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "상품을 찾을 수 없습니다."));
    }

    private List<String> storeImages(List<MultipartFile> images) {
        try {
            Path imageDir = Paths.get(storageProperties.imageDir()).toAbsolutePath().normalize();
            Files.createDirectories(imageDir);
            List<String> imageUrls = new ArrayList<>();

            for (MultipartFile image : images) {
                if (image == null || image.isEmpty()) {
                    continue;
                }
                String original = image.getOriginalFilename() == null ? "image" : image.getOriginalFilename();
                String ext = original.contains(".") ? original.substring(original.lastIndexOf('.')) : "";
                String filename = UUID.randomUUID() + ext;
                Files.copy(image.getInputStream(), imageDir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
                imageUrls.add(storageProperties.publicUrlPrefix() + "/" + filename);
            }

            return imageUrls;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "이미지 저장에 실패했습니다.");
        }
    }

    private List<String> normalizeStrings(List<String> values) {
        if (values == null) {
            return List.of();
        }
        return values.stream()
            .filter(value -> value != null && !value.isBlank())
            .map(String::trim)
            .distinct()
            .toList();
    }
}
