package com.finora.portfolio.repository;

import com.finora.portfolio.model.GrowthAssumptions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GrowthAssumptionsRepository extends JpaRepository<GrowthAssumptions, String> {
}
