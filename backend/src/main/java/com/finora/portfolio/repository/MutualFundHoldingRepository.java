package com.finora.portfolio.repository;

import com.finora.portfolio.model.MutualFundHolding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MutualFundHoldingRepository extends JpaRepository<MutualFundHolding, String> {
    List<MutualFundHolding> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<MutualFundHolding> findByIdAndUserId(String id, String userId);
}
