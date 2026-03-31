package com.kumohcse.tracelog.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.kumohcse.tracelog.domain.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @EntityGraph(attributePaths = {"images", "categories", "sizes", "materials"})
    @Query("""
        select distinct p
        from Product p
        left join fetch p.images
        left join fetch p.categories
        left join fetch p.sizes
        left join fetch p.materials
        order by p.createdAt desc
        """)
    List<Product> findAllWithDetailsOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"images", "categories", "sizes", "materials"})
    @Query("""
        select distinct p
        from Product p
        left join fetch p.images
        left join fetch p.categories
        left join fetch p.sizes
        left join fetch p.materials
        where p.id = :id
        """)
    Optional<Product> findDetailById(Long id);
}
