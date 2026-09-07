package com.finora.portfolio.repository;

import com.finora.portfolio.model.MetalHolding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MetalHoldingRepository extends JpaRepository<MetalHolding, String> {
    List<MetalHolding> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<MetalHolding> findByIdAndUserId(String id, String userId);
}
