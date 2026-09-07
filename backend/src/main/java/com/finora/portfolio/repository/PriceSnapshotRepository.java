package com.finora.portfolio.repository;

import com.finora.portfolio.model.PriceSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PriceSnapshotRepository extends JpaRepository<PriceSnapshot, String> {
    Optional<PriceSnapshot> findByHoldingIdAndCapturedDate(String holdingId, LocalDate capturedDate);
    List<PriceSnapshot> findByHoldingIdOrderByCapturedDateDesc(String holdingId);
    List<PriceSnapshot> findByUserIdOrderByCapturedDateAsc(String userId);
}
