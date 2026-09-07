package com.finora.portfolio.repository;

import com.finora.portfolio.model.RealEstate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RealEstateRepository extends JpaRepository<RealEstate, String> {
    List<RealEstate> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<RealEstate> findByIdAndUserId(String id, String userId);
}
