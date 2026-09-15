package com.finora.portfolio.repository;

import com.finora.portfolio.model.NpsSchemeAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NpsSchemeAllocationRepository extends JpaRepository<NpsSchemeAllocation, String> {
    Optional<NpsSchemeAllocation> findByNpsHoldingId(String npsHoldingId);
}
