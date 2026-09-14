package com.finora.networth.repository;

import com.finora.networth.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, String> {
    List<Asset> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<Asset> findByIdAndUserId(String id, String userId);
}
