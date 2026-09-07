package com.finora.portfolio.repository;

import com.finora.portfolio.model.Bond;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BondRepository extends JpaRepository<Bond, String> {
    List<Bond> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<Bond> findByIdAndUserId(String id, String userId);
}
