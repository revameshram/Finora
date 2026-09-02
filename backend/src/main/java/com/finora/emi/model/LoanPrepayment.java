package com.finora.emi.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "em_loan_prepayments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanPrepayment {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "loan_id", nullable = false, length = 64)
    private String loanId;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "prepayment_type", nullable = false, length = 32)
    @Builder.Default
    private PrepaymentType prepaymentType = PrepaymentType.ONE_TIME;

    @Enumerated(EnumType.STRING)
    @Column(name = "impact", nullable = false, length = 32)
    @Builder.Default
    private PrepaymentImpact impact = PrepaymentImpact.REDUCE_TENURE;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
