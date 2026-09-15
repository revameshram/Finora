package com.finora.portfolio.repository;

import com.finora.portfolio.model.StockHolding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockHoldingRepository extends JpaRepository<StockHolding, String> {
    List<StockHolding> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<StockHolding> findByIdAndUserId(String id, String userId);
}
