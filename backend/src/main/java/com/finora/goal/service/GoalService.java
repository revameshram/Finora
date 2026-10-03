package com.finora.goal.service;

import com.finora.common.growth.CompoundGrowthEngine;
import com.finora.goal.dto.*;
import com.finora.goal.model.*;
import com.finora.goal.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final GoalContributionRepository contributionRepository;
    private final GoalInvestmentLinkRepository investmentLinkRepository;
    private final GoalMilestoneRepository milestoneRepository;
    private final GoalManagerSettingsRepository settingsRepository;
    private final com.finora.portfolio.service.PortfolioAssetService portfolioAssetService;
    private final com.finora.expense.service.ExpenseService expenseService;

    @Transactional(readOnly = true)
    public List<com.finora.expense.contract.dto.GoalLinkedTransactionDto> getGoalLinkedTransactions(String userId, String goalId) {
        if (expenseService != null) {
            return expenseService.getGoalLinkedTransactionsContract(userId, goalId);
        }
        return List.of();
    }

    @Transactional(readOnly = true)
    public GoalDashboardSummaryDto getDashboardSummary(String userId) {
        GoalManagerSettings settings = getOrCreateSettings(userId);
        List<Goal> goals = goalRepository.findByUserId(userId);

        BigDecimal totalSaved = BigDecimal.ZERO;
        BigDecimal totalTarget = BigDecimal.ZERO;
        BigDecimal totalAdjFv = BigDecimal.ZERO;
        BigDecimal totalRequiredMonthly = BigDecimal.ZERO;
        int onTrack = 0;
        int behind = 0;

        List<GoalDto> goalDtos = new ArrayList<>();
        Map<String, BigDecimal> categoryAllocations = new HashMap<>();

        Goal nextDueGoal = null;
        long minDaysRemaining = Long.MAX_VALUE;

        for (Goal g : goals) {
            if (g.getStatus() == GoalStatus.ARCHIVED) {
                continue;
            }
            GoalDto dto = toGoalDto(g, settings);
            goalDtos.add(dto);

            totalSaved = totalSaved.add(dto.getCurrentValue());
            totalTarget = totalTarget.add(dto.getTargetAmount());
            totalAdjFv = totalAdjFv.add(dto.getAdjustedFutureValue());

            if (g.getStatus() == GoalStatus.ACTIVE || g.getStatus() == GoalStatus.BEHIND) {
                totalRequiredMonthly = totalRequiredMonthly.add(dto.getRequiredMonthlyContribution());
                if (dto.getDaysRemaining() > 0 && dto.getDaysRemaining() < minDaysRemaining) {
                    minDaysRemaining = dto.getDaysRemaining();
                    nextDueGoal = g;
                }
            }

            if (dto.getStatus() == GoalStatus.BEHIND) {
                behind++;
            } else if (dto.getStatus() == GoalStatus.ACTIVE || dto.getStatus() == GoalStatus.COMPLETED) {
                onTrack++;
            }

            categoryAllocations.merge(
                g.getCategory().getDisplayName(),
                dto.getCurrentValue(),
                BigDecimal::add
            );
        }

        BigDecimal overallProgress = totalAdjFv.compareTo(BigDecimal.ZERO) > 0
            ? totalSaved.multiply(new BigDecimal("100")).divide(totalAdjFv, 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        BigDecimal capacity = settings.getMonthlySavingsCapacity();
        boolean isOverCapacity = totalRequiredMonthly.compareTo(capacity) > 0;
        BigDecimal overage = isOverCapacity ? totalRequiredMonthly.subtract(capacity) : BigDecimal.ZERO;

        List<GoalNudgeDto> nudges = generateNudges(goalDtos, settings, isOverCapacity, overage);

        return GoalDashboardSummaryDto.builder()
            .totalSavedAmount(totalSaved)
            .totalTargetAmount(totalTarget)
            .totalAdjustedFutureValue(totalAdjFv)
            .overallProgressPercentage(overallProgress)
            .activeGoalsCount((int) goals.stream().filter(g -> g.getStatus() != GoalStatus.ARCHIVED).count())
            .onTrackCount(onTrack)
            .behindCount(behind)
            .totalRequiredMonthlyContribution(totalRequiredMonthly)
            .monthlySavingsCapacity(capacity)
            .isOverCapacity(isOverCapacity)
            .capacityOverageAmount(overage)
            .nextDueGoalName(nextDueGoal != null ? nextDueGoal.getName() : "None")
            .nextDueDays(nextDueGoal != null ? minDaysRemaining : 0)
            .goals(goalDtos)
            .allocationByCategory(categoryAllocations)
            .nudges(nudges)
            .build();
    }

    @Transactional(readOnly = true)
    public List<GoalDto> getGoals(String userId, GoalStatus statusFilter) {
        GoalManagerSettings settings = getOrCreateSettings(userId);
        List<Goal> goals = (statusFilter != null)
            ? goalRepository.findByUserIdAndStatus(userId, statusFilter)
            : goalRepository.findByUserId(userId);

        return goals.stream()
            .map(g -> toGoalDto(g, settings))
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GoalDetailResponse getGoalDetail(String goalId, String userId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
            .orElseThrow(() -> new IllegalArgumentException("Goal not found: " + goalId));
        GoalManagerSettings settings = getOrCreateSettings(userId);

        GoalDto dto = toGoalDto(goal, settings);
        List<GoalContributionDto> history = contributionRepository.findByGoalIdOrderByDateDescCreatedAtDesc(goalId)
            .stream()
            .map(c -> GoalContributionDto.builder()
                .id(c.getId())
                .goalId(c.getGoalId())
                .goalName(goal.getName())
                .type(c.getType())
                .amount(c.getAmount())
                .date(c.getDate())
                .note(c.getNote())
                .sourceType(c.getSourceType())
                .createdAt(c.getCreatedAt())
                .build())
            .collect(Collectors.toList());

        List<GoalMilestoneDto> milestones = milestoneRepository.findByGoalIdOrderByTargetPctAsc(goalId)
            .stream()
            .map(m -> GoalMilestoneDto.builder()
                .id(m.getId())
                .goalId(m.getGoalId())
                .label(m.getLabel())
                .targetPct(m.getTargetPct())
                .isAchieved(m.getAchievedAt() != null || dto.getProgressPercentage().compareTo(m.getTargetPct()) >= 0)
                .achievedAt(m.getAchievedAt())
                .createdAt(m.getCreatedAt())
                .build())
            .collect(Collectors.toList());

        List<String> linkedAssetIds = investmentLinkRepository.findByGoalId(goalId)
            .stream()
            .map(GoalInvestmentLink::getPortfolioAssetId)
            .collect(Collectors.toList());

        List<GoalTrajectoryPointDto> trajectory = calculateTrajectory(goal, dto, history);

        return GoalDetailResponse.builder()
            .goal(dto)
            .history(history)
            .milestones(milestones)
            .trajectory(trajectory)
            .linkedPortfolioAssetIds(linkedAssetIds)
            .build();
    }

    @Transactional
    public GoalDto createGoal(CreateGoalRequest request, String userId) {
        GoalManagerSettings settings = getOrCreateSettings(userId);
        BigDecimal inflation = request.getInflationRatePct() != null ? request.getInflationRatePct() : settings.getDefaultInflationRatePct();
        BigDecimal expectedReturn = request.getExpectedAnnualReturnPct() != null ? request.getExpectedAnnualReturnPct() : new BigDecimal("10.0");
        BigDecimal startBal = request.getStartingBalance() != null ? request.getStartingBalance() : BigDecimal.ZERO;

        Goal goal = Goal.builder()
            .id(UUID.randomUUID().toString())
            .userId(userId)
            .name(request.getName())
            .category(request.getCategory())
            .priority(request.getPriority() != null ? request.getPriority() : GoalPriority.MEDIUM)
            .targetAmount(request.getTargetAmount())
            .targetIsFutureValue(Boolean.TRUE.equals(request.getTargetIsFutureValue()))
            .targetDate(request.getTargetDate())
            .inflationRatePct(inflation)
            .expectedAnnualReturnPct(expectedReturn)
            .contributionFrequency(request.getContributionFrequency() != null ? request.getContributionFrequency() : "MONTHLY")
            .startingBalance(startBal)
            .accountLabel(request.getAccountLabel())
            .currentValue(startBal)
            .status(GoalStatus.ACTIVE)
            .notes(request.getNotes())
            .build();

        goal = goalRepository.save(goal);

        // Seed default milestones
        createDefaultMilestones(goal.getId());

        // Process linked portfolio investments (enforcing 1 investment -> 1 goal constraint)
        if (request.getLinkedPortfolioAssetIds() != null && !request.getLinkedPortfolioAssetIds().isEmpty()) {
            for (String assetId : request.getLinkedPortfolioAssetIds()) {
                investmentLinkRepository.deleteByPortfolioAssetIdAndLinkedProfileId(assetId, userId);
                GoalInvestmentLink link = GoalInvestmentLink.builder()
                    .goalId(goal.getId())
                    .portfolioAssetId(assetId)
                    .linkedProfileId(userId)
                    .build();
                investmentLinkRepository.save(link);
            }
        }

        recalculateGoalCurrentValue(goal);
        return toGoalDto(goal, settings);
    }

    @Transactional
    public GoalDto updateGoal(String goalId, CreateGoalRequest request, String userId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
            .orElseThrow(() -> new IllegalArgumentException("Goal not found: " + goalId));
        GoalManagerSettings settings = getOrCreateSettings(userId);

        goal.setName(request.getName());
        goal.setCategory(request.getCategory());
        if (request.getPriority() != null) goal.setPriority(request.getPriority());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setTargetIsFutureValue(Boolean.TRUE.equals(request.getTargetIsFutureValue()));
        goal.setTargetDate(request.getTargetDate());
        if (request.getInflationRatePct() != null) goal.setInflationRatePct(request.getInflationRatePct());
        if (request.getExpectedAnnualReturnPct() != null) goal.setExpectedAnnualReturnPct(request.getExpectedAnnualReturnPct());
        if (request.getContributionFrequency() != null) goal.setContributionFrequency(request.getContributionFrequency());
        if (request.getStartingBalance() != null) goal.setStartingBalance(request.getStartingBalance());
        goal.setAccountLabel(request.getAccountLabel());
        goal.setNotes(request.getNotes());

        if (request.getLinkedPortfolioAssetIds() != null) {
            investmentLinkRepository.deleteByGoalId(goalId);
            for (String assetId : request.getLinkedPortfolioAssetIds()) {
                investmentLinkRepository.deleteByPortfolioAssetIdAndLinkedProfileId(assetId, userId);
                GoalInvestmentLink link = GoalInvestmentLink.builder()
                    .goalId(goalId)
                    .portfolioAssetId(assetId)
                    .linkedProfileId(userId)
                    .build();
                investmentLinkRepository.save(link);
            }
        }

        recalculateGoalCurrentValue(goal);
        return toGoalDto(goal, settings);
    }

    @Transactional
    public void deleteGoal(String goalId, String userId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
            .orElseThrow(() -> new IllegalArgumentException("Goal not found: " + goalId));
        investmentLinkRepository.deleteByGoalId(goalId);
        goalRepository.delete(goal);
    }

    @Transactional
    public GoalDto recordContribution(CreateContributionRequest request, String userId) {
        Goal goal = goalRepository.findByIdAndUserId(request.getGoalId(), userId)
            .orElseThrow(() -> new IllegalArgumentException("Goal not found: " + request.getGoalId()));

        GoalContribution contrib = GoalContribution.builder()
            .goalId(goal.getId())
            .type(request.getType() != null ? request.getType() : GoalContributionType.CONTRIBUTION)
            .amount(request.getAmount())
            .date(request.getDate() != null ? request.getDate() : LocalDate.now())
            .note(request.getNote())
            .sourceType(GoalContributionSourceType.MANUAL)
            .build();

        contributionRepository.save(contrib);
        recalculateGoalCurrentValue(goal);

        GoalManagerSettings settings = getOrCreateSettings(userId);
        return toGoalDto(goal, settings);
    }

    @Transactional
    public List<GoalDto> recordBulkContribution(BulkContributionRequest request, String userId) {
        GoalManagerSettings settings = getOrCreateSettings(userId);
        List<Goal> activeGoals = goalRepository.findByUserIdAndStatus(userId, GoalStatus.ACTIVE);
        if (activeGoals.isEmpty()) {
            activeGoals = goalRepository.findByUserId(userId).stream()
                .filter(g -> g.getStatus() != GoalStatus.ARCHIVED)
                .collect(Collectors.toList());
        }

        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();
        String mode = request.getMode() != null ? request.getMode().toUpperCase() : "PER_GOAL";

        if ("PER_GOAL".equals(mode) && request.getGoalAllocations() != null) {
            for (Map.Entry<String, BigDecimal> entry : request.getGoalAllocations().entrySet()) {
                if (entry.getValue() != null && entry.getValue().compareTo(BigDecimal.ZERO) > 0) {
                    GoalContribution contrib = GoalContribution.builder()
                        .goalId(entry.getKey())
                        .type(GoalContributionType.CONTRIBUTION)
                        .amount(entry.getValue())
                        .date(date)
                        .note(request.getNote() != null ? request.getNote() : "Bulk contribution (Per goal)")
                        .sourceType(GoalContributionSourceType.BULK)
                        .build();
                    contributionRepository.save(contrib);
                }
            }
        } else if ("SPLIT_PCT".equals(mode) && request.getTotalAmount() != null && request.getGoalPercentages() != null) {
            BigDecimal totalAmt = request.getTotalAmount();
            for (Map.Entry<String, BigDecimal> entry : request.getGoalPercentages().entrySet()) {
                BigDecimal pct = entry.getValue();
                if (pct != null && pct.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal alloc = totalAmt.multiply(pct).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                    GoalContribution contrib = GoalContribution.builder()
                        .goalId(entry.getKey())
                        .type(GoalContributionType.CONTRIBUTION)
                        .amount(alloc)
                        .date(date)
                        .note(request.getNote() != null ? request.getNote() : "Bulk contribution (Split %)")
                        .sourceType(GoalContributionSourceType.BULK)
                        .build();
                    contributionRepository.save(contrib);
                }
            }
        } else if ("SPLIT_FIXED".equals(mode) && request.getGoalAllocations() != null) {
            for (Map.Entry<String, BigDecimal> entry : request.getGoalAllocations().entrySet()) {
                if (entry.getValue() != null && entry.getValue().compareTo(BigDecimal.ZERO) > 0) {
                    GoalContribution contrib = GoalContribution.builder()
                        .goalId(entry.getKey())
                        .type(GoalContributionType.CONTRIBUTION)
                        .amount(entry.getValue())
                        .date(date)
                        .note(request.getNote() != null ? request.getNote() : "Bulk contribution (Fixed split)")
                        .sourceType(GoalContributionSourceType.BULK)
                        .build();
                    contributionRepository.save(contrib);
                }
            }
        }

        // Recalculate all affected goals
        for (Goal g : activeGoals) {
            recalculateGoalCurrentValue(g);
        }

        return activeGoals.stream()
            .map(g -> toGoalDto(g, settings))
            .collect(Collectors.toList());
    }

    @Transactional
    public GoalDto updateGoalStatus(String goalId, GoalStatus status, String userId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
            .orElseThrow(() -> new IllegalArgumentException("Goal not found: " + goalId));
        goal.setStatus(status);
        goalRepository.save(goal);
        return toGoalDto(goal, getOrCreateSettings(userId));
    }

    @Transactional(readOnly = true)
    public GoalManagerSettingsDto getSettings(String userId) {
        GoalManagerSettings settings = getOrCreateSettings(userId);
        return GoalManagerSettingsDto.builder()
            .id(settings.getId())
            .userId(settings.getUserId())
            .monthlySavingsCapacity(settings.getMonthlySavingsCapacity())
            .behindScheduleThresholdPct(settings.getBehindScheduleThresholdPct())
            .defaultInflationRatePct(settings.getDefaultInflationRatePct())
            .build();
    }

    @Transactional
    public GoalManagerSettingsDto updateSettings(GoalManagerSettingsDto dto, String userId) {
        GoalManagerSettings settings = getOrCreateSettings(userId);
        if (dto.getMonthlySavingsCapacity() != null) settings.setMonthlySavingsCapacity(dto.getMonthlySavingsCapacity());
        if (dto.getBehindScheduleThresholdPct() != null) settings.setBehindScheduleThresholdPct(dto.getBehindScheduleThresholdPct());
        if (dto.getDefaultInflationRatePct() != null) settings.setDefaultInflationRatePct(dto.getDefaultInflationRatePct());
        settingsRepository.save(settings);

        return GoalManagerSettingsDto.builder()
            .id(settings.getId())
            .userId(settings.getUserId())
            .monthlySavingsCapacity(settings.getMonthlySavingsCapacity())
            .behindScheduleThresholdPct(settings.getBehindScheduleThresholdPct())
            .defaultInflationRatePct(settings.getDefaultInflationRatePct())
            .build();
    }

    @Transactional
    public void seedSampleData(String userId) {
        if (!goalRepository.findByUserId(userId).isEmpty()) {
            log.info("Sample goals already seeded for user: {}", userId);
            return;
        }

        LocalDate today = LocalDate.now();

        // Goal 1: Emergency Fund
        Goal g1 = Goal.builder()
            .id(UUID.randomUUID().toString())
            .userId(userId)
            .name("6-Month Emergency Shield")
            .category(GoalCategory.EMERGENCY_FUND)
            .priority(GoalPriority.HIGH)
            .targetAmount(new BigDecimal("600000.0000"))
            .targetIsFutureValue(true)
            .targetDate(today.plusMonths(12))
            .inflationRatePct(new BigDecimal("6.0"))
            .expectedAnnualReturnPct(new BigDecimal("7.0"))
            .startingBalance(new BigDecimal("250000.0000"))
            .accountLabel("HDFC Savings & Liquid MF")
            .notes("Covers ₹1,00,000 monthly living expenses for 6 months")
            .build();
        goalRepository.save(g1);
        createDefaultMilestones(g1.getId());

        GoalContribution c1 = GoalContribution.builder()
            .goalId(g1.getId())
            .type(GoalContributionType.CONTRIBUTION)
            .amount(new BigDecimal("50000.0000"))
            .date(today.minusMonths(2))
            .note("Monthly emergency allocation")
            .build();
        contributionRepository.save(c1);

        GoalContribution c2 = GoalContribution.builder()
            .goalId(g1.getId())
            .type(GoalContributionType.CONTRIBUTION)
            .amount(new BigDecimal("50000.0000"))
            .date(today.minusMonths(1))
            .note("Monthly emergency allocation")
            .build();
        contributionRepository.save(c2);

        // Goal 2: Japan Family Vacation
        Goal g2 = Goal.builder()
            .id(UUID.randomUUID().toString())
            .userId(userId)
            .name("Tokyo & Kyoto Cherry Blossom Trip")
            .category(GoalCategory.VACATION)
            .priority(GoalPriority.MEDIUM)
            .targetAmount(new BigDecimal("350000.0000"))
            .targetIsFutureValue(false)
            .targetDate(today.plusMonths(18))
            .inflationRatePct(new BigDecimal("6.0"))
            .expectedAnnualReturnPct(new BigDecimal("9.0"))
            .startingBalance(new BigDecimal("60000.0000"))
            .accountLabel("ICICI Travel Savings")
            .notes("Flights, hotels, and rail passes for 4 people")
            .build();
        goalRepository.save(g2);
        createDefaultMilestones(g2.getId());

        GoalContribution c3 = GoalContribution.builder()
            .goalId(g2.getId())
            .type(GoalContributionType.CONTRIBUTION)
            .amount(new BigDecimal("25000.0000"))
            .date(today.minusMonths(1))
            .note("Vacation SIP transfer")
            .build();
        contributionRepository.save(c3);

        // Goal 3: Home Down Payment
        Goal g3 = Goal.builder()
            .id(UUID.randomUUID().toString())
            .userId(userId)
            .name("Whitefield Apartment Down Payment")
            .category(GoalCategory.HOME_DOWNPAYMENT)
            .priority(GoalPriority.HIGH)
            .targetAmount(new BigDecimal("2500000.0000"))
            .targetIsFutureValue(false)
            .targetDate(today.plusMonths(36))
            .inflationRatePct(new BigDecimal("7.0"))
            .expectedAnnualReturnPct(new BigDecimal("12.0"))
            .startingBalance(new BigDecimal("400000.0000"))
            .accountLabel("Parag Parikh Flexi Cap Fund")
            .notes("20% down payment on 3BHK in East Bangalore")
            .build();
        goalRepository.save(g3);
        createDefaultMilestones(g3.getId());

        GoalContribution c4 = GoalContribution.builder()
            .goalId(g3.getId())
            .type(GoalContributionType.CONTRIBUTION)
            .amount(new BigDecimal("35000.0000"))
            .date(today.minusMonths(1))
            .note("Monthly home equity SIP")
            .build();
        contributionRepository.save(c4);

        // Goal 4: Long-Term Wealth Core
        Goal g4 = Goal.builder()
            .id(UUID.randomUUID().toString())
            .userId(userId)
            .name("₹1 Crore Core Compounding Bucket")
            .category(GoalCategory.WEALTH_BUILDING)
            .priority(GoalPriority.MEDIUM)
            .targetAmount(new BigDecimal("10000000.0000"))
            .targetIsFutureValue(true)
            .targetDate(today.plusMonths(84))
            .inflationRatePct(new BigDecimal("6.0"))
            .expectedAnnualReturnPct(new BigDecimal("13.5"))
            .startingBalance(new BigDecimal("1200000.0000"))
            .accountLabel("Zerodha Direct Equity & Nifty 50 ETF")
            .notes("Primary wealth creation bucket")
            .build();
        goalRepository.save(g4);
        createDefaultMilestones(g4.getId());

        recalculateGoalCurrentValue(g1);
        recalculateGoalCurrentValue(g2);
        recalculateGoalCurrentValue(g3);
        recalculateGoalCurrentValue(g4);
    }

    private void recalculateGoalCurrentValue(Goal goal) {
        BigDecimal startBal = goal.getStartingBalance() != null ? goal.getStartingBalance() : BigDecimal.ZERO;
        List<GoalContribution> contribs = contributionRepository.findByGoalIdOrderByDateDescCreatedAtDesc(goal.getId());

        BigDecimal contribSum = BigDecimal.ZERO;
        for (GoalContribution c : contribs) {
            if (c.getType() == GoalContributionType.CONTRIBUTION) {
                contribSum = contribSum.add(c.getAmount());
            } else if (c.getType() == GoalContributionType.WITHDRAWAL) {
                contribSum = contribSum.subtract(c.getAmount());
            }
        }

        // Sum linked portfolio holdings with live valuations
        List<GoalInvestmentLink> links = investmentLinkRepository.findByGoalId(goal.getId());
        BigDecimal linkedPortfolioSum = BigDecimal.ZERO;

        if (!links.isEmpty() && portfolioAssetService != null) {
            try {
                var valuations = portfolioAssetService.collectAllValuations(goal.getUserId());
                Map<String, BigDecimal> valMap = valuations.stream()
                        .collect(Collectors.toMap(com.finora.portfolio.service.AssetValuation::getId,
                                com.finora.portfolio.service.AssetValuation::getCurrentValue,
                                (a, b) -> a));

                for (GoalInvestmentLink link : links) {
                    if (link.getPortfolioAssetId() != null) {
                        BigDecimal assetVal = valMap.getOrDefault(link.getPortfolioAssetId(), BigDecimal.ZERO);
                        linkedPortfolioSum = linkedPortfolioSum.add(assetVal);
                    }
                }
            } catch (Exception e) {
                log.warn("Could not calculate live portfolio asset value for goal {}: {}", goal.getId(), e.getMessage());
            }
        }

        BigDecimal totalCurrent = startBal.add(contribSum).add(linkedPortfolioSum);
        goal.setCurrentValue(totalCurrent);

        // Update status if needed
        GoalManagerSettings settings = getOrCreateSettings(goal.getUserId());
        GoalDto dto = toGoalDto(goal, settings);
        if (goal.getStatus() != GoalStatus.PAUSED && goal.getStatus() != GoalStatus.ARCHIVED) {
            goal.setStatus(dto.getStatus());
        }

        goalRepository.save(goal);
    }

    private GoalDto toGoalDto(Goal goal, GoalManagerSettings settings) {
        LocalDate today = LocalDate.now();
        long daysRemaining = Math.max(0, ChronoUnit.DAYS.between(today, goal.getTargetDate()));
        long totalDays = Math.max(1, ChronoUnit.DAYS.between(goal.getCreatedAt().toLocalDate(), goal.getTargetDate()));

        // Calculate Adjusted Future Value
        BigDecimal adjFv;
        if (Boolean.TRUE.equals(goal.getTargetIsFutureValue())) {
            adjFv = goal.getTargetAmount();
        } else {
            double years = Math.max(0.1, (double) daysRemaining / 365.25);
            double inflation = goal.getInflationRatePct() != null ? goal.getInflationRatePct().doubleValue() / 100.0 : 0.06;
            adjFv = CompoundGrowthEngine.calculateCompoundGrowth(goal.getTargetAmount(), inflation, years)
                .setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal current = goal.getCurrentValue() != null ? goal.getCurrentValue() : BigDecimal.ZERO;
        BigDecimal progressPct = adjFv.compareTo(BigDecimal.ZERO) > 0
            ? current.multiply(new BigDecimal("100")).divide(adjFv, 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        // Calculate required monthly contribution
        BigDecimal requiredMonthly = BigDecimal.ZERO;
        if (progressPct.compareTo(new BigDecimal("100")) < 0 && daysRemaining > 0) {
            BigDecimal shortfall = adjFv.subtract(current);
            if (shortfall.compareTo(BigDecimal.ZERO) > 0) {
                int remainingMonths = Math.max(1, (int) Math.ceil((double) daysRemaining / 30.4375));
                double annualRate = goal.getExpectedAnnualReturnPct() != null
                    ? goal.getExpectedAnnualReturnPct().doubleValue() / 100.0
                    : 0.10;
                requiredMonthly = CompoundGrowthEngine.calculateRequiredMonthlySip(shortfall, annualRate, remainingMonths)
                    .setScale(2, RoundingMode.HALF_UP);
            }
        }

        // On Track vs Behind status check
        GoalStatus status = goal.getStatus();
        if (status != GoalStatus.PAUSED && status != GoalStatus.ARCHIVED) {
            if (progressPct.compareTo(new BigDecimal("100")) >= 0) {
                status = GoalStatus.COMPLETED;
            } else {
                double elapsedRatio = (double) Math.max(0, ChronoUnit.DAYS.between(goal.getCreatedAt().toLocalDate(), today)) / totalDays;
                BigDecimal expectedProgress = adjFv.multiply(BigDecimal.valueOf(elapsedRatio));
                BigDecimal behindThreshold = settings.getBehindScheduleThresholdPct() != null ? settings.getBehindScheduleThresholdPct() : new BigDecimal("10.0");
                BigDecimal lagPct = expectedProgress.compareTo(BigDecimal.ZERO) > 0
                    ? expectedProgress.subtract(current).multiply(new BigDecimal("100")).divide(expectedProgress, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

                if (lagPct.compareTo(behindThreshold) > 0 && elapsedRatio > 0.05) {
                    status = GoalStatus.BEHIND;
                } else {
                    status = GoalStatus.ACTIVE;
                }
            }
        }

        return GoalDto.builder()
            .id(goal.getId())
            .userId(goal.getUserId())
            .name(goal.getName())
            .category(goal.getCategory())
            .priority(goal.getPriority())
            .targetAmount(goal.getTargetAmount())
            .targetIsFutureValue(goal.getTargetIsFutureValue())
            .adjustedFutureValue(adjFv)
            .targetDate(goal.getTargetDate())
            .daysRemaining(daysRemaining)
            .inflationRatePct(goal.getInflationRatePct())
            .expectedAnnualReturnPct(goal.getExpectedAnnualReturnPct())
            .contributionFrequency(goal.getContributionFrequency())
            .startingBalance(goal.getStartingBalance())
            .accountLabel(goal.getAccountLabel())
            .currentValue(current)
            .linkedInvestmentsValue(BigDecimal.ZERO)
            .manualSavedValue(current)
            .progressPercentage(progressPct)
            .requiredMonthlyContribution(requiredMonthly)
            .status(status)
            .notes(goal.getNotes())
            .isIncluded(goal.isIncluded())
            .isLinked(goal.isLinked())
            .sourceModule(goal.getSourceModule() != null ? goal.getSourceModule().name() : "MANUAL")
            .sourceEntityId(goal.getSourceEntityId())
            .createdAt(goal.getCreatedAt())
            .updatedAt(goal.getUpdatedAt())
            .build();
    }

    private List<GoalTrajectoryPointDto> calculateTrajectory(Goal goal, GoalDto dto, List<GoalContributionDto> history) {
        List<GoalTrajectoryPointDto> points = new ArrayList<>();
        LocalDate start = goal.getCreatedAt().toLocalDate();
        LocalDate target = goal.getTargetDate();

        long totalDays = Math.max(1, ChronoUnit.DAYS.between(start, target));
        int steps = 6;
        long dayStep = Math.max(1, totalDays / steps);

        BigDecimal startVal = goal.getStartingBalance() != null ? goal.getStartingBalance() : BigDecimal.ZERO;
        BigDecimal targetVal = dto.getAdjustedFutureValue();

        for (int i = 0; i <= steps; i++) {
            LocalDate d = start.plusDays(i * dayStep);
            if (d.isAfter(target)) d = target;

            double ratio = (double) (i * dayStep) / totalDays;
            if (ratio > 1.0) ratio = 1.0;

            BigDecimal planned = startVal.add(targetVal.subtract(startVal).multiply(BigDecimal.valueOf(ratio))).setScale(2, RoundingMode.HALF_UP);

            // Compute cumulative actual up to date d
            LocalDate evalDate = d;
            BigDecimal actualContribs = history.stream()
                .filter(c -> !c.getDate().isAfter(evalDate))
                .map(c -> c.getType() == GoalContributionType.CONTRIBUTION ? c.getAmount() : c.getAmount().negate())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal actual = startVal.add(actualContribs);
            BigDecimal gap = actual.subtract(planned);
            BigDecimal gapPct = planned.compareTo(BigDecimal.ZERO) > 0
                ? gap.multiply(new BigDecimal("100")).divide(planned, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

            points.add(GoalTrajectoryPointDto.builder()
                .date(d)
                .plannedAmount(planned)
                .actualAmount(actual)
                .gapAmount(gap)
                .gapPercentage(gapPct)
                .build());
        }

        return points;
    }

    private List<GoalNudgeDto> generateNudges(List<GoalDto> goals, GoalManagerSettings settings, boolean isOverCapacity, BigDecimal overage) {
        List<GoalNudgeDto> nudges = new ArrayList<>();

        if (isOverCapacity) {
            nudges.add(GoalNudgeDto.builder()
                .id(UUID.randomUUID().toString())
                .type("CAPACITY_OVERAGE")
                .severity("CRITICAL")
                .title("Monthly Capacity Exceeded")
                .message("Your required goal contributions exceed your monthly savings capacity by ₹" + overage + "/mo.")
                .actionLabel("Adjust Capacity")
                .build());
        }

        for (GoalDto g : goals) {
            if (g.getStatus() == GoalStatus.BEHIND) {
                nudges.add(GoalNudgeDto.builder()
                    .id(UUID.randomUUID().toString())
                    .goalId(g.getId())
                    .goalName(g.getName())
                    .type("BEHIND_PACE")
                    .severity("WARNING")
                    .title(g.getName() + " is Behind Pace")
                    .message("Requires ₹" + g.getRequiredMonthlyContribution() + "/mo to catch up before " + g.getTargetDate() + ".")
                    .actionLabel("Contribute Now")
                    .build());
            } else if (g.getStatus() == GoalStatus.COMPLETED) {
                nudges.add(GoalNudgeDto.builder()
                    .id(UUID.randomUUID().toString())
                    .goalId(g.getId())
                    .goalName(g.getName())
                    .type("COMPLETED_CELEBRATION")
                    .severity("SUCCESS")
                    .title("Goal Achieved! 🎉")
                    .message("Congratulations! " + g.getName() + " has reached 100% of its target!")
                    .actionLabel("View Detail")
                    .build());
            }
        }

        return nudges;
    }

    private void createDefaultMilestones(String goalId) {
        milestoneRepository.save(GoalMilestone.builder().goalId(goalId).label("25% Quarter Milestone").targetPct(new BigDecimal("25.0")).build());
        milestoneRepository.save(GoalMilestone.builder().goalId(goalId).label("50% Halfway Mark").targetPct(new BigDecimal("50.0")).build());
        milestoneRepository.save(GoalMilestone.builder().goalId(goalId).label("75% Final Stretch").targetPct(new BigDecimal("75.0")).build());
        milestoneRepository.save(GoalMilestone.builder().goalId(goalId).label("100% Target Achieved").targetPct(new BigDecimal("100.0")).build());
    }

    private GoalManagerSettings getOrCreateSettings(String userId) {
        return settingsRepository.findByUserId(userId).orElseGet(() -> {
            GoalManagerSettings s = GoalManagerSettings.builder()
                .userId(userId)
                .monthlySavingsCapacity(new BigDecimal("50000.0000"))
                .behindScheduleThresholdPct(new BigDecimal("10.00"))
                .defaultInflationRatePct(new BigDecimal("6.00"))
                .build();
            return settingsRepository.save(s);
        });
    }
}
