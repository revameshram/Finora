package com.finora.emi.repository;

import com.finora.emi.model.LoanEmiLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoanEmiLogRepository extends JpaRepository<LoanEmiLog, String> {
    List<LoanEmiLog> findByLoanIdOrderByInstallmentNumberAsc(String loanId);
    Optional<LoanEmiLog> findByLoanIdAndInstallmentNumber(String loanId, Integer installmentNumber);
    void deleteByLoanId(String loanId);
}
