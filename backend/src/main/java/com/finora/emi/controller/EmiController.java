package com.finora.emi.controller;

import com.finora.common.auth.security.UserPrincipal;
import com.finora.emi.dto.*;
import com.finora.emi.service.EmiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/emi")
@RequiredArgsConstructor
@Tag(name = "EMI Manager", description = "Loan portfolios, Amortization schedules, Prepayment simulation & Net Worth liability syncing")
public class EmiController {

    private final EmiService emiService;

    private String resolveUserId(UserPrincipal principal) {
        return principal != null ? principal.getId() : "usr_demo_user_001";
    }

    @GetMapping("/loans")
    @Operation(summary = "List all user loans with live metrics")
    public ResponseEntity<List<LoanDto>> getLoans(@AuthenticationPrincipal UserPrincipal principal) {
        String userId = resolveUserId(principal);
        return ResponseEntity.ok(emiService.getLoans(userId));
    }

    @PostMapping("/loans")
    @Operation(summary = "Create a new loan and optionally sync with Net Worth Tracker")
    public ResponseEntity<LoanDto> createLoan(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateLoanRequest request
    ) {
        String userId = resolveUserId(principal);
        LoanDto created = emiService.createLoan(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/loans/{loanId}")
    @Operation(summary = "Get loan details by ID")
    public ResponseEntity<LoanDto> getLoanById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String loanId
    ) {
        String userId = resolveUserId(principal);
        return ResponseEntity.ok(emiService.getLoanById(userId, loanId));
    }

    @PutMapping("/loans/{loanId}")
    @Operation(summary = "Update loan parameters")
    public ResponseEntity<LoanDto> updateLoan(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String loanId,
            @Valid @RequestBody UpdateLoanRequest request
    ) {
        String userId = resolveUserId(principal);
        return ResponseEntity.ok(emiService.updateLoan(userId, loanId, request));
    }

    @DeleteMapping("/loans/{loanId}")
    @Operation(summary = "Delete a loan")
    public ResponseEntity<Void> deleteLoan(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String loanId
    ) {
        String userId = resolveUserId(principal);
        emiService.deleteLoan(userId, loanId);
        return ResponseEntity.noContent().build();
    }

    // --- Prepayments ---

    @PostMapping("/loans/{loanId}/prepayments")
    @Operation(summary = "Add a prepayment to a loan and recalculate schedule")
    public ResponseEntity<LoanPrepaymentDto> addPrepayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String loanId,
            @Valid @RequestBody AddPrepaymentRequest request
    ) {
        String userId = resolveUserId(principal);
        LoanPrepaymentDto created = emiService.addPrepayment(userId, loanId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/loans/{loanId}/prepayments")
    @Operation(summary = "List prepayments for a loan")
    public ResponseEntity<List<LoanPrepaymentDto>> getPrepayments(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String loanId
    ) {
        String userId = resolveUserId(principal);
        return ResponseEntity.ok(emiService.getPrepayments(userId, loanId));
    }

    @DeleteMapping("/loans/{loanId}/prepayments/{prepayId}")
    @Operation(summary = "Delete a prepayment")
    public ResponseEntity<Void> deletePrepayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String loanId,
            @PathVariable String prepayId
    ) {
        String userId = resolveUserId(principal);
        emiService.deletePrepayment(userId, loanId, prepayId);
        return ResponseEntity.noContent().build();
    }

    // --- Amortization & Simulation ---

    @GetMapping("/loans/{loanId}/amortization")
    @Operation(summary = "Get full monthly and yearly amortization schedule")
    public ResponseEntity<AmortizationScheduleDto> getAmortizationSchedule(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String loanId
    ) {
        String userId = resolveUserId(principal);
        return ResponseEntity.ok(emiService.getAmortizationSchedule(userId, loanId));
    }

    @PostMapping("/loans/{loanId}/simulate-prepayment")
    @Operation(summary = "Simulate prepayment impact (Tenure vs EMI reduction & interest saved)")
    public ResponseEntity<PrepaymentSimulationResultDto> simulatePrepayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String loanId,
            @Valid @RequestBody PrepaymentSimulationRequest request
    ) {
        String userId = resolveUserId(principal);
        return ResponseEntity.ok(emiService.simulatePrepayment(userId, loanId, request));
    }

    @PostMapping("/calculate")
    @Operation(summary = "Standalone EMI calculation (pure mathematical engine)")
    public ResponseEntity<StandaloneEmiCalculateResponse> calculateStandalone(
            @Valid @RequestBody StandaloneEmiCalculateRequest request
    ) {
        return ResponseEntity.ok(emiService.calculateStandalone(request));
    }

    // --- Expense Tracker Cash Flow Matching ---

    @GetMapping("/loans/{loanId}/expense-matches")
    @Operation(summary = "Reconcile with Expense Tracker to match recurring bank EMI debits")
    public ResponseEntity<List<EmiExpenseMatchDto>> matchExpenseTrackerTransactions(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String loanId
    ) {
        String userId = resolveUserId(principal);
        return ResponseEntity.ok(emiService.matchExpenseTrackerTransactions(userId, loanId));
    }

    // --- 1-Click Sample Data Seeder ---

    @PostMapping("/seed-sample")
    @Operation(summary = "Seed realistic sample loans (₹50L Home Loan & ₹8.5L Car Loan)")
    public ResponseEntity<List<LoanDto>> seedSampleLoans(@AuthenticationPrincipal UserPrincipal principal) {
        String userId = resolveUserId(principal);
        return ResponseEntity.ok(emiService.seedSampleLoans(userId));
    }
}
