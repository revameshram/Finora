package com.finora.portfolio.repository;

import com.finora.portfolio.model.Deposit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepositRepository extends JpaRepository<Deposit, String> {
    List<Deposit> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<Deposit> findByIdAndUserId(String id, String userId);
}
