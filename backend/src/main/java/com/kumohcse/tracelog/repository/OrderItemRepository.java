package com.kumohcse.tracelog.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kumohcse.tracelog.domain.OrderItem;
import com.kumohcse.tracelog.dto.product.AdminSalesResponse;
import com.kumohcse.tracelog.dto.product.ProductSalesResponse;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("""
        select new com.kumohcse.tracelog.dto.product.ProductSalesResponse(
            oi.product.id,
            sum(oi.quantity)
        )
        from OrderItem oi
        group by oi.product.id
        """)
    List<ProductSalesResponse> findPublicSales();

    @Query("""
        select new com.kumohcse.tracelog.dto.product.AdminSalesResponse(
            oi.product.id,
            oi.nameSnapshot,
            sum(oi.quantity),
            sum(oi.priceSnapshot * oi.quantity)
        )
        from OrderItem oi
        join oi.order o
        where o.paidAt >= coalesce(:start, o.paidAt)
          and o.paidAt <= coalesce(:end, o.paidAt)
        group by oi.product.id, oi.nameSnapshot
        order by sum(oi.priceSnapshot * oi.quantity) desc
        """)
    List<AdminSalesResponse> findAdminSales(
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );
}
