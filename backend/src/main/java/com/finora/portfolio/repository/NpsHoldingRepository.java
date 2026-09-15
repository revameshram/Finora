package com.finora.portfolio.repository;

import com.finora.portfolio.model.NpsHolding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NpsHoldingRepository extends JpaRepository<NpsHolding, String> {
    List<NpsHolding> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<NpsHolding> findByIdAndUserId(String id, String userId);
}
