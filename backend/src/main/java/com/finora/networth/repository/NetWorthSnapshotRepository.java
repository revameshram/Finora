package com.finora.networth.repository;

import com.finora.networth.model.NetWorthSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface NetWorthSnapshotRepository extends JpaRepository<NetWorthSnapshot, String> {
    List<NetWorthSnapshot> findByUserIdOrderBySnapshotDateAsc(String userId);
    Optional<NetWorthSnapshot> findByUserIdAndSnapshotDate(String userId, LocalDate snapshotDate);
}
