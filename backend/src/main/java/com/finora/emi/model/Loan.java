package com.finora.emi.model;

import com.finora.common.linking.model.LinkableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "em_loans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@lombok.experimental.SuperBuilder
public class Loan extends LinkableEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(name = "loan_name", nullable = false, length = 128)
    private String loanName;

    @Enumerated(EnumType.STRING)
    @Column(name = "loan_type", nullable = false, length = 32)
    private LoanType loanType;

    @Column(name = "lender_name", length = 128)
    private String lenderName;

    @Column(name = "account_number_masked", length = 64)
    private String accountNumberMasked;

    @Column(name = "sanctioned_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal sanctionedAmount;

    @Column(name = "current_outstanding", nullable = false, precision = 15, scale = 2)
    private BigDecimal currentOutstanding;

    @Column(name = "annual_interest_rate", nullable = false, precision = 6, scale = 3)
    private BigDecimal annualInterestRate;

    @Column(name = "tenure_months", nullable = false)
    private Integer tenureMonths;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "monthly_emi", nullable = false, precision = 15, scale = 2)
    private BigDecimal monthlyEmi;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    @Builder.Default
    private LoanStatus status = LoanStatus.ACTIVE;

    @Column(name = "linked_net_worth_liability_id", length = 64)
    private String linkedNetWorthLiabilityId;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
