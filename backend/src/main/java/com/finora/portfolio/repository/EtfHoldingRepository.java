package com.finora.portfolio.repository;

import com.finora.portfolio.model.EtfHolding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EtfHoldingRepository extends JpaRepository<EtfHolding, String> {
    List<EtfHolding> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<EtfHolding> findByIdAndUserId(String id, String userId);
}
