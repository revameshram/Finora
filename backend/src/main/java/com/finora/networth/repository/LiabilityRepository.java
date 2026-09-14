package com.finora.networth.repository;

import com.finora.networth.model.Liability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LiabilityRepository extends JpaRepository<Liability, String> {
    List<Liability> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<Liability> findByIdAndUserId(String id, String userId);
}
