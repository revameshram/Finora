package com.finora.emi.service;

import com.finora.common.linking.model.SourceModule;
import com.finora.emi.dto.*;
import com.finora.emi.engine.EmiCalculationEngine;
import com.finora.emi.model.*;
import com.finora.emi.repository.LoanEmiLogRepository;
import com.finora.emi.repository.LoanPrepaymentRepository;
import com.finora.emi.repository.LoanRepository;
import com.finora.expense.model.ExpenseTransaction;
import com.finora.expense.repository.ExpenseTransactionRepository;
import com.finora.networth.contract.dto.CreateLiabilityRequest;
import com.finora.networth.contract.dto.NetWorthLiabilityDto;
import com.finora.networth.service.NetWorthLiabilityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmiService {

    private final LoanRepository loanRepository;
    private final LoanPrepaymentRepository prepaymentRepository;
    private final LoanEmiLogRepository emiLogRepository;
    private final EmiCalculationEngine calculationEngine;
    private final NetWorthLiabilityService netWorthLiabilityService;
    private final ExpenseTransactionRepository expenseTransactionRepository;

    @Transactional
    public LoanDto createLoan(String userId, CreateLoanRequest request) {
        String loanId = "loan_" + UUID.randomUUID().toString().substring(0, 8);

        BigDecimal emi = request.getCustomMonthlyEmi() != null && request.getCustomMonthlyEmi().compareTo(BigDecimal.ZERO) > 0
                ? request.getCustomMonthlyEmi()
                : calculationEngine.calculateMonthlyEmi(request.getSanctionedAmount(), request.getAnnualInterestRate(), request.getTenureMonths());

        Loan loan = Loan.builder()
                .id(loanId)
                .userId(userId)
                .loanName(request.getLoanName())
                .loanType(request.getLoanType())
                .lenderName(request.getLenderName())
                .accountNumberMasked(request.getAccountNumberMasked())
                .sanctionedAmount(request.getSanctionedAmount())
                .currentOutstanding(request.getSanctionedAmount())
                .annualInterestRate(request.getAnnualInterestRate())
                .tenureMonths(request.getTenureMonths())
                .startDate(request.getStartDate())
                .monthlyEmi(emi)
                .status(LoanStatus.ACTIVE)
                .notes(request.getNotes())
                .build();

        loan.setIncluded(true);
        loan.setLinked(false);
        loan.setSourceModule(SourceModule.MANUAL);

        // Cross-track contract sync: Push to Net Worth Tracker if requested
        if (Boolean.TRUE.equals(request.getSyncWithNetWorth())) {
            try {
                CreateLiabilityRequest liabilityReq = CreateLiabilityRequest.builder()
                        .name(request.getLoanName())
                        .category(request.getLoanType().name())
                        .balance(request.getSanctionedAmount())
                        .originalAmount(request.getSanctionedAmount())
                        .interestRate(request.getAnnualInterestRate())
                        .isIncluded(true)
                        .sourceModule(SourceModule.EMI_MANAGER)
                        .sourceEntityId(loanId)
                        .build();

                NetWorthLiabilityDto res = netWorthLiabilityService.createLiabilityFromContract(userId, liabilityReq);
                if (res != null) {
                    loan.setLinkedNetWorthLiabilityId(res.getId());
                    loan.setLinked(true);
                    loan.setSourceModule(SourceModule.EMI_MANAGER);
                    loan.setSourceEntityId(res.getId());
                    loan.setLinkedAt(LocalDateTime.now());
                }
            } catch (Exception e) {
                log.warn("Could not push loan liability to Net Worth Tracker contract: {}", e.getMessage());
            }
        }

        Loan saved = loanRepository.save(loan);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<LoanDto> getLoans(String userId) {
        return loanRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LoanDto getLoanById(String userId, String loanId) {
        Loan loan = loanRepository.findByIdAndUserId(loanId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Loan not found: " + loanId));
        return mapToDto(loan);
    }

    @Transactional
    public LoanDto updateLoan(String userId, String loanId, UpdateLoanRequest request) {
        Loan loan = loanRepository.findByIdAndUserId(loanId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Loan not found: " + loanId));

        if (request.getLoanName() != null) loan.setLoanName(request.getLoanName());
        if (request.getLoanType() != null) loan.setLoanType(request.getLoanType());
        if (request.getLenderName() != null) loan.setLenderName(request.getLenderName());
        if (request.getAccountNumberMasked() != null) loan.setAccountNumberMasked(request.getAccountNumberMasked());
        if (request.getSanctionedAmount() != null) loan.setSanctionedAmount(request.getSanctionedAmount());
        if (request.getAnnualInterestRate() != null) loan.setAnnualInterestRate(request.getAnnualInterestRate());
        if (request.getTenureMonths() != null) loan.setTenureMonths(request.getTenureMonths());
        if (request.getStartDate() != null) loan.setStartDate(request.getStartDate());
        if (request.getStatus() != null) loan.setStatus(request.getStatus());
        if (request.getNotes() != null) loan.setNotes(request.getNotes());

        if (request.getMonthlyEmi() != null && request.getMonthlyEmi().compareTo(BigDecimal.ZERO) > 0) {
            loan.setMonthlyEmi(request.getMonthlyEmi());
        } else if (request.getSanctionedAmount() != null || request.getAnnualInterestRate() != null || request.getTenureMonths() != null) {
            loan.setMonthlyEmi(calculationEngine.calculateMonthlyEmi(loan.getSanctionedAmount(), loan.getAnnualInterestRate(), loan.getTenureMonths()));
        }

        Loan saved = loanRepository.save(loan);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteLoan(String userId, String loanId) {
        Loan loan = loanRepository.findByIdAndUserId(loanId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Loan not found: " + loanId));

        prepaymentRepository.deleteByLoanId(loanId);
        emiLogRepository.deleteByLoanId(loanId);
        loanRepository.delete(loan);
    }

    // --- Prepayments ---

    @Transactional
    public LoanPrepaymentDto addPrepayment(String userId, String loanId, AddPrepaymentRequest request) {
        Loan loan = loanRepository.findByIdAndUserId(loanId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Loan not found: " + loanId));

        LoanPrepayment prepayment = LoanPrepayment.builder()
                .id("prep_" + UUID.randomUUID().toString().substring(0, 8))
                .loanId(loan.getId())
                .paymentDate(request.getPaymentDate())
                .amount(request.getAmount())
                .prepaymentType(request.getPrepaymentType() != null ? request.getPrepaymentType() : PrepaymentType.ONE_TIME)
                .impact(request.getImpact() != null ? request.getImpact() : PrepaymentImpact.REDUCE_TENURE)
                .notes(request.getNotes())
                .build();

        LoanPrepayment saved = prepaymentRepository.save(prepayment);

        // Recalculate and update current outstanding balance
        AmortizationScheduleDto schedule = calculationEngine.generateAmortizationSchedule(
                loan.getId(),
                loan.getSanctionedAmount(),
                loan.getAnnualInterestRate(),
                loan.getTenureMonths(),
                loan.getStartDate(),
                loan.getMonthlyEmi(),
                prepaymentRepository.findByLoanIdOrderByPaymentDateAsc(loan.getId())
        );

        loan.setCurrentOutstanding(schedule.getCurrentOutstanding());
        loanRepository.save(loan);

        return mapPrepaymentToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<LoanPrepaymentDto> getPrepayments(String userId, String loanId) {
        loanRepository.findByIdAndUserId(loanId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Loan not found: " + loanId));

        return prepaymentRepository.findByLoanIdOrderByPaymentDateAsc(loanId)
                .stream()
                .map(this::mapPrepaymentToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletePrepayment(String userId, String loanId, String prepaymentId) {
        loanRepository.findByIdAndUserId(loanId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Loan not found: " + loanId));

        prepaymentRepository.deleteById(prepaymentId);
    }

    // --- Amortization & Simulation ---

    @Transactional(readOnly = true)
    public AmortizationScheduleDto getAmortizationSchedule(String userId, String loanId) {
        Loan loan = loanRepository.findByIdAndUserId(loanId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Loan not found: " + loanId));

        List<LoanPrepayment> prepayments = prepaymentRepository.findByLoanIdOrderByPaymentDateAsc(loanId);

        return calculationEngine.generateAmortizationSchedule(
                loan.getId(),
                loan.getSanctionedAmount(),
                loan.getAnnualInterestRate(),
                loan.getTenureMonths(),
                loan.getStartDate(),
                loan.getMonthlyEmi(),
                prepayments
        );
    }

    @Transactional(readOnly = true)
    public PrepaymentSimulationResultDto simulatePrepayment(String userId, String loanId, PrepaymentSimulationRequest request) {
        Loan loan = loanRepository.findByIdAndUserId(loanId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Loan not found: " + loanId));

        return calculationEngine.simulatePrepaymentScenario(
                loan.getSanctionedAmount(),
                loan.getAnnualInterestRate(),
                loan.getTenureMonths(),
                loan.getStartDate(),
                request
        );
    }

    public StandaloneEmiCalculateResponse calculateStandalone(StandaloneEmiCalculateRequest request) {
        return calculationEngine.calculateStandalone(request);
    }

    // --- Expense Tracker Cash-Flow Matching (Internal) ---

    @Transactional(readOnly = true)
    public List<EmiExpenseMatchDto> matchExpenseTrackerTransactions(String userId, String loanId) {
        Loan loan = loanRepository.findByIdAndUserId(loanId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Loan not found: " + loanId));

        List<ExpenseTransaction> userExpenses = expenseTransactionRepository.findByProfileId(userId);

        BigDecimal emiAmt = loan.getMonthlyEmi();
        String loanNameClean = loan.getLoanName().toLowerCase();

        return userExpenses.stream()
                .filter(t -> {
                    boolean amountMatch = t.getAmount() != null && t.getAmount().subtract(emiAmt).abs().doubleValue() < 50.0;
                    boolean descMatch = t.getItem() != null && (t.getItem().toLowerCase().contains("emi") ||
                            t.getItem().toLowerCase().contains("loan") ||
                            t.getItem().toLowerCase().contains(loanNameClean));
                    return amountMatch || descMatch;
                })
                .map(t -> EmiExpenseMatchDto.builder()
                        .transactionId(t.getId())
                        .description(t.getItem() + (t.getDescription() != null ? " - " + t.getDescription() : ""))
                        .amount(t.getAmount())
                        .transactionDate(t.getPaymentDate())
                        .paymentMethod(t.getPaymentMethod())
                        .isMatched(true)
                        .matchedInstallmentNumber(1)
                        .build())
                .collect(Collectors.toList());
    }

    // --- 1-Click Sample Data Seeder ---

    @Transactional
    public List<LoanDto> seedSampleLoans(String userId) {
        // Delete existing demo loans for fresh seed
        List<Loan> existing = loanRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Loan l : existing) {
            prepaymentRepository.deleteByLoanId(l.getId());
            emiLogRepository.deleteByLoanId(l.getId());
            loanRepository.delete(l);
        }

        // 1. Prime Home Loan: ₹50,00,000 @ 8.5% for 240 months
        Loan homeLoan = Loan.builder()
                .id("loan_hl_" + UUID.randomUUID().toString().substring(0, 8))
                .userId(userId)
                .loanName("HDFC Prime Home Loan")
                .loanType(LoanType.HOME_LOAN)
                .lenderName("HDFC Bank")
                .accountNumberMasked("•••• •••• 9421")
                .sanctionedAmount(new BigDecimal("5000000.00"))
                .currentOutstanding(new BigDecimal("4420000.00"))
                .annualInterestRate(new BigDecimal("8.50"))
                .tenureMonths(240)
                .startDate(LocalDate.now().minusMonths(24))
                .monthlyEmi(new BigDecimal("43391.00"))
                .status(LoanStatus.ACTIVE)
                .notes("20-year apartment mortgage with PMAY subsidy. Interest rate floating.")
                .build();
        homeLoan.setIncluded(true);
        homeLoan.setLinked(true);
        homeLoan.setSourceModule(SourceModule.EMI_MANAGER);
        homeLoan.setSourceEntityId("lia_nw_hl_01");
        homeLoan.setLinkedAt(LocalDateTime.now().minusMonths(24));
        Loan savedHl = loanRepository.save(homeLoan);

        // Prepayment on Home Loan: ₹5,00,000 at month 12
        LoanPrepayment hlPrepay = LoanPrepayment.builder()
                .id("prep_hl_01")
                .loanId(savedHl.getId())
                .paymentDate(LocalDate.now().minusMonths(12))
                .amount(new BigDecimal("500000.00"))
                .prepaymentType(PrepaymentType.ONE_TIME)
                .impact(PrepaymentImpact.REDUCE_TENURE)
                .notes("Annual performance bonus prepayment to shorten tenure")
                .build();
        prepaymentRepository.save(hlPrepay);

        // 2. Car Loan: ₹8,50,000 @ 9.2% for 60 months
        Loan carLoan = Loan.builder()
                .id("loan_cl_" + UUID.randomUUID().toString().substring(0, 8))
                .userId(userId)
                .loanName("ICICI Auto Loan (EV SUV)")
                .loanType(LoanType.CAR_LOAN)
                .lenderName("ICICI Bank")
                .accountNumberMasked("•••• •••• 3810")
                .sanctionedAmount(new BigDecimal("850000.00"))
                .currentOutstanding(new BigDecimal("580000.00"))
                .annualInterestRate(new BigDecimal("9.20"))
                .tenureMonths(60)
                .startDate(LocalDate.now().minusMonths(18))
                .monthlyEmi(new BigDecimal("17724.00"))
                .status(LoanStatus.ACTIVE)
                .notes("5-year fixed interest auto loan with zero foreclosure charges after 2 years.")
                .build();
        carLoan.setIncluded(true);
        carLoan.setLinked(false);
        carLoan.setSourceModule(SourceModule.MANUAL);
        Loan savedCl = loanRepository.save(carLoan);

        return List.of(mapToDto(savedHl), mapToDto(savedCl));
    }

    // --- Mapping Helpers ---

    private LoanDto mapToDto(Loan loan) {
        List<LoanPrepayment> prepayments = prepaymentRepository.findByLoanIdOrderByPaymentDateAsc(loan.getId());

        AmortizationScheduleDto schedule = calculationEngine.generateAmortizationSchedule(
                loan.getId(),
                loan.getSanctionedAmount(),
                loan.getAnnualInterestRate(),
                loan.getTenureMonths(),
                loan.getStartDate(),
                loan.getMonthlyEmi(),
                prepayments
        );

        double sanctioned = loan.getSanctionedAmount().doubleValue();
        double paid = schedule.getTotalPrincipalPaid().doubleValue();
        double progress = sanctioned > 0 ? (paid * 100.0) / sanctioned : 0.0;

        return LoanDto.builder()
                .id(loan.getId())
                .userId(loan.getUserId())
                .loanName(loan.getLoanName())
                .loanType(loan.getLoanType())
                .lenderName(loan.getLenderName())
                .accountNumberMasked(loan.getAccountNumberMasked())
                .sanctionedAmount(loan.getSanctionedAmount())
                .currentOutstanding(schedule.getCurrentOutstanding())
                .annualInterestRate(loan.getAnnualInterestRate())
                .tenureMonths(loan.getTenureMonths())
                .startDate(loan.getStartDate())
                .projectedEndDate(schedule.getProjectedPayoffDate())
                .monthlyEmi(loan.getMonthlyEmi())
                .status(loan.getStatus())
                .linkedNetWorthLiabilityId(loan.getLinkedNetWorthLiabilityId())
                .notes(loan.getNotes())
                .totalPrincipalPaid(schedule.getTotalPrincipalPaid())
                .totalInterestPaid(schedule.getTotalInterestPaid())
                .totalPrepaymentPaid(schedule.getTotalPrepaymentPaid())
                .totalPaymentPayable(schedule.getTotalAmountPayable())
                .totalInterestPayable(schedule.getTotalInterestPaid())
                .progressPercent(Math.round(progress * 10.0) / 10.0)
                .remainingTenureMonths(schedule.getActualTenureMonths())
                .isLinked(loan.isLinked())
                .isIncluded(loan.isIncluded())
                .createdAt(loan.getCreatedAt())
                .build();
    }

    private LoanPrepaymentDto mapPrepaymentToDto(LoanPrepayment p) {
        return LoanPrepaymentDto.builder()
                .id(p.getId())
                .loanId(p.getLoanId())
                .paymentDate(p.getPaymentDate())
                .amount(p.getAmount())
                .prepaymentType(p.getPrepaymentType())
                .impact(p.getImpact())
                .notes(p.getNotes())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
