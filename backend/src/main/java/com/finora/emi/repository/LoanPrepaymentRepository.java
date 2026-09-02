package com.finora.emi.repository;

import com.finora.emi.model.LoanPrepayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanPrepaymentRepository extends JpaRepository<LoanPrepayment, String> {
    List<LoanPrepayment> findByLoanIdOrderByPaymentDateAsc(String loanId);
    void deleteByLoanId(String loanId);
}
