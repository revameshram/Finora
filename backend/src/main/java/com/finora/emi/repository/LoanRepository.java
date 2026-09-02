package com.finora.emi.repository;

import com.finora.emi.model.Loan;
import com.finora.emi.model.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoanRepository extends JpaRepository<Loan, String> {
    List<Loan> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Loan> findByUserIdAndStatus(String userId, LoanStatus status);
    Optional<Loan> findByIdAndUserId(String id, String userId);
}
