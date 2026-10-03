# Finora — Master Project Documentation & Status Tracker

> **The Definitive Source of Truth** for Finora: Product Architecture, Module Specs, Mathematical Engines, Live Integration Pipelines, Security Protocols, Feature Status, and Technical Implementation.

**Last Updated:** 2026-10-04  
**Project Lead:** Finora Engineering  
**Version:** 1.0.0 (Production-Ready)  

---

## 1. Executive Summary & Vision

**Finora** is a privacy-first, institutional-grade personal wealth, cash flow, and life administration platform reverse-engineered from Westro and elevated into an integrated 8-module suite. 

Unlike traditional fragmented financial tools, Finora unifies:
1. **Long-Term Wealth Accumulation** (Multi-Asset Portfolios, Balance Sheet Net Worth, Milestone Goal Costing, and FIRE Retirement Modeling).
2. **Day-to-Day Cash Flow & Debt Management** (Budget Month Scoping, Reducing Balance Loan Amortization, and Multi-Currency Group Travel Splitting).
3. **Zero-Knowledge Digital Safety** (Client-Side Encrypted Credentials & Vault Locker).
4. **Cross-Module Intelligence** (Suite-Wide Insights 0–100 Health Score, cross-tool deep linking, and automated contract data pipelines).

---

## 2. Core Architecture & Tech Stack

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             FINORA CLIENT (SPA)                                  │
│   React 18 · TypeScript · Tailwind CSS · Vite · Lucide Icons · WebCrypto API    │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ REST APIs + JWT Bearer
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│                          FINORA BACKEND ENGINE                                   │
│   Spring Boot 3.3.4 (Java 21) · Spring Security · Spring Data JPA                │
│   Caffeine In-Memory Multi-Tier Cache · Scheduled Live Market Pricing Workers   │
├──────────────────────────────────────────────────────────────────────────────────┤
│ CORE ENGINES:                                                                    │
│   • EmiCalculationEngine (Reducing Balance Math & Prepayment Sandbox)            │
│   • CompoundGrowthEngine (Compound Growth, Annuities, Reverse SIP Costing)       │
│   • SuiteInsightsService (4-Pillar Composite Health Scoring: 0–100)              │
│   • SmartSplitSolver (Minimal Transaction Debt Graph Resolution)                 │
│   • MarketPricingService (Strategy Pattern: Yahoo / AMFI / Gold-API / Open-ER)  │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ JPA / JDBC
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│                         DATA PERSISTENCE LAYER                                   │
│   PostgreSQL / Supabase (Production) · H2 Database (In-Memory Development/Test)  │
│   Base Currency Anchor: INR with Dynamic Multi-Currency Presentation             │
└──────────────────────────────────────────────────────────────────────────────────┘
```

| Layer | Technology | Key Details |
|---|---|---|
| **Frontend Framework** | React 18 + TypeScript | Strict typing, functional components, React Hooks, Vite build pipeline |
| **Styling & Design System** | Tailwind CSS | Warm luxury palette: Obsidian Pine (`#1C1917`), Linen (`#FAFAF9`), Brass (`#B88728`), Cream (`#FEF3C7`) |
| **Backend Framework** | Spring Boot 3.3.4 | Java 21 LTS, Spring Security, Spring Data JPA, Hibernate ORM |
| **Database** | PostgreSQL / Supabase & H2 | Single base currency (INR) storage, UUID / deterministic ID keys, foreign key constraints |
| **Authentication** | Stateless JWT | HMAC-SHA256 token issuance & validation, 24h validity, BCrypt password hashing |
| **Security & Crypto** | WebCrypto API | Client-side `PBKDF2-SHA256` (100,000 rounds) + `AES-GCM-256` with 96-bit random IV |
| **Caching Layer** | Caffeine Cache | 5-minute TTL for live asset pricing, 1-hour TTL for currency FX exchange rates |
| **Live Market Feeds** | Multi-API Strategy Pattern | Yahoo Finance v8 (Equities/ETFs), AMFI/`mfapi.in` (Mutual Funds), Gold-API (Metals), Open-ER (Forex) |

---

## 3. High-Level Module Status Matrix

| # | Module | Status | Primary Purpose & How It Works |
|---|---|---|---|
| **0** | **Shared Foundation** | **Done** | Auth/JWT, Single base INR Currency Service, `@MappedSuperclass LinkableEntity`, Toast, Modal & Onboarding design systems. |
| **1** | **Portfolio Tracker** | **Done** | Multi-asset tracker (Indian & US Equities, MFs, SGBs, Real Estate, FDs) with live external pricing and auto-refresh. |
| **2** | **Expense Tracker** | **Done** | Budget Month (`YYYY-MM`) scoping, `Pending` vs `Done` states, Copy Month utility, cash velocity, and cross-module Summary API. |
| **3** | **Net Worth Tracker** | **Done** | Consolidated balance sheet (Assets minus Liabilities), Portfolio auto-sync, per-class delinking, and 3-scenario growth projections. |
| **4** | **Loan / EMI Manager** | **Done** | Reducing balance amortization engine, Net Worth liability sync, Prepay vs Invest arbitrage sandbox, and CSV export. |
| **5** | **Goal Manager** | **Done** | Reverse SIP target costing, inflation compounding, "one investment $\rightarrow$ one goal" constraint, and monthly capacity monitoring. |
| **6** | **FIRE Planner** | **Done** | 4% SWR retirement engine, dual modes (Years to FIRE vs Required Savings), and live Expense Tracker cash-flow synchronization. |
| **7** | **Trip Manager** | **Done** | 5-tab travel planner, AI-assisted itinerary generator, multi-currency conversion, and minimal transaction Smart Split solver. |
| **8** | **Encrypted Vault** | **Done** | Zero-knowledge client-side encrypted notes locker, 3 emergency backup codes, SVG CAPTCHA unlock gate, and timed 30s reveal. |
| **9** | **Suite-Wide Insights** | **Done** | 4-pillar composite Financial Health Score (0–100), life-area key metrics grid, asset allocation donut, and strategic cross-tool action nudges. |
| **10**| **Learn Content Hub** | **Done** | Educational guides with cross-tool deep linking pre-populating goal targets and FIRE calculations via URL parameters. |

---

## 4. In-Depth Module Specifications: "What Is Done & How It's Done"

---

### 4.1 Shared Foundation & Identity
- **Status:** **Done (100%)**
- **Core Package:** `com.finora.common.*`
- **How It's Done:**
  - **Identity & Auth:** Stateless JWT filter (`JwtAuthenticationFilter`) intercepting requests, validating HMAC-SHA256 signatures, and loading `UserPrincipal`. Password hashes use `BCryptPasswordEncoder`. Seeded with a single primary demo user (`alok@finora.local` / `password123`).
  - **Currency Service:** All monetary fields across every database table are anchored strictly in **base INR**. The `CurrencyService` fetches real-time mid-market rates for 160+ currencies via `open.er-api.com` with a 1-hour Caffeine cache. Frontend components (`<Money />`, `<CurrencySelector />`, `<CurrencyInput />`) handle bidirectional conversion seamlessly on the fly.
  - **Universal Linking Mechanism:** `@MappedSuperclass LinkableEntity` provides `isIncluded`, `isLinked`, `sourceModule`, `sourceEntityId`, and `linkedAt` across all domain entities.
  - **Delink Semantics:** Delinking any linked asset or liability freezes its valuation, resets `isLinked = false` and `sourceModule = MANUAL`, enabling independent editing while preserving calculation integrity.

---

### 4.2 Portfolio Tracker
- **Status:** **Done (100%)**
- **Core Package:** `com.finora.portfolio.*`
- **Frontend:** `frontend/src/components/portfolio/PortfolioTracker.tsx`
- **How It's Done:**
  - **Asset Class Polymorphism:** JPA Joined-Table inheritance where base `PortfolioAsset` (`pf_assets`) joins subclass tables: `pf_indian_stocks`, `pf_us_stocks`, `pf_mutual_funds`, `pf_deposits`, `pf_bonds`, `pf_metals`, `pf_real_estates`, and `pf_others`.
  - **Live Pricing Pipeline:** `PortfolioPricingService` implements the Strategy Pattern with dedicated strategies:
    - *Indian & US Equities / ETFs:* Fetches real-time market data from Yahoo Finance v8 (`query1.finance.yahoo.com` & `query2.finance.yahoo.com`) with browser user-agent headers and fallback symbol transformations (`.NS` / `.BO`).
    - *Mutual Funds:* Fetches latest NAVs from the Association of Mutual Funds in India (AMFI) via `api.mfapi.in`.
    - *Precious Metals:* Fetches live Spot Gold/Silver/Platinum rates via `api.gold-api.com` and converts USD/troy-oz to INR/gram using live Forex rates.
  - **Caffeine Background Refresh:** Centralized `CacheConfig` with `@EnableCaching` and `@Scheduled(fixedRate = 300000)` refreshing asset valuations every 5 minutes in background threads.
  - **Analytics Engine:** Computes Total Invested, Total Current Valuation, Total Unrealized Gain/Loss (₹ and %), Top Gainers / Top Laggards ranking, Sector/Class allocation distribution, and Growth Outlook projections (1Y/3Y/5Y).

---

### 4.3 Monthly Expense Tracker
- **Status:** **Done (100%)**
- **Core Package:** `com.finora.expense.*`
- **Frontend:** `frontend/src/components/expense/ExpenseTracker.tsx`
- **How It's Done:**
  - **Deterministic Month Scoping:** All cash flows are strictly scoped to a `budgetMonth` string (`YYYY-MM`). Users navigate historical and forward months via a persistent month toolbar.
  - **"Copy Month" Duplication Utility:** Replicates fixed income sources, copies recurring expense templates with `Pending` status, and duplicates recurring tasks with `TODO` status from any previous month.
  - **Settlement State Machine:** Every transaction is flagged as `Pending` or `Done`. "Done" debits represent actual cleared cash outflow, while "Pending" debits represent committed future payables (e.g. uncleared credit cards or cheques).
  - **Cross-Track Summary API Contract:** Exposes `GET /api/v1/expenses/summary` calculating total income, total outflow, savings rate %, pending drag, and annualized living spend consumed by the FIRE Planner and Goal Manager.
  - **Goal Tagging:** Expense transactions can tag a `linkedGoalId` for reporting without mutating goal balances (`GoalTag` non-mutating rule).

---

### 4.4 Net Worth Tracker
- **Status:** **Done (100%)**
- **Core Package:** `com.finora.networth.*`
- **Frontend:** `frontend/src/components/networth/NetWorthTracker.tsx`
- **How It's Done:**
  - **Consolidated Balance Sheet:** Aggregates 9 Asset categories (`CASH_BANK`, `INVESTMENTS`, `CRYPTO`, `GOLD_SILVER`, `REAL_ESTATE`, `VEHICLES`, `RETIREMENT_ACCOUNTS`, `BUSINESS_ASSETS`, `OTHER`) and 7 Liability categories (`HOME_LOAN`, `CAR_LOAN`, `PERSONAL_LOAN`, `CREDIT_CARD`, `STUDENT_LOAN`, `BUSINESS_LOAN`, `OTHER_DEBT`).
  - **Portfolio Integration & Flat Growth Nuance:** Portfolio holdings are automatically read into Net Worth as read-only linked assets. In forward growth projections, portfolio assets are held flat at 0% CAGR to avoid double-counting active equity market volatility against balance sheet compounding.
  - **Per-Class Delinking:** Any asset class can be individually delinked, converting it into a standalone manual asset preserving its last frozen valuation.
  - **Shared Growth Engine:** Powered by `CompoundGrowthEngine` (`com.finora.common.growth`), providing 3-scenario growth projections (Conservative 5%, Moderate 10%, Aggressive 15% CAGR) with Rule-of-72 doubling milestones.
  - **Solvency Diagnostics:** Calculates Debt-to-Asset Ratio ($< 0.35$ benchmark) and Liquidity Ratio ($> 0.40$ liquid asset benchmark).

---

### 4.5 Loan / EMI Manager
- **Status:** **Done (100%)**
- **Core Package:** `com.finora.emi.*`
- **Frontend:** `frontend/src/components/emi/EmiManager.tsx`
- **How It's Done:**
  - **Reducing Balance Math Engine:** Implements the exact banking formula in `EmiCalculationEngine`:
    $$E = P \cdot r \cdot \frac{(1+r)^n}{(1+r)^n - 1}$$
    where $P = \text{Principal}$, $r = \frac{\text{Annual Rate}}{12 \times 100}$, and $n = \text{Tenure in Months}$.
  - **Full Amortization Schedule:** Calculates month-by-month Principal component, Interest component, Prepayment deductions, and Closing Principal with calendar-year accordion drilldowns and one-click CSV export.
  - **Prepay vs. Invest Arbitrage Visualizer:** Features a side-by-side comparison sandbox:
    - *Option A (Prepay Loan):* Guaranteed, risk-free, tax-free interest avoided over remaining tenure.
    - *Option B (Invest in Equities):* Compound growth of the same cash invested at an assumed return (adjustable 6.0%–16.0% CAGR slider):
      $$FV = P_{\text{sim}} \cdot (1 + r)^t$$
    - *Strategy Verdict:* Computes net arbitrage difference and renders actionable financial guidance.
  - **Net Worth Liability Sync:** Automatically creates and updates linked liability entries in Net Worth Tracker via `POST /api/v1/networth/liabilities`.
  - **Expense Tracker Reconciliation:** Scans `et_transactions` to identify matching monthly bank EMI debits.

---

### 4.6 Goal Manager
- **Status:** **Done (100%)**
- **Core Package:** `com.finora.goal.*`
- **Frontend:** `frontend/src/components/goal/GoalManager.tsx`
- **How It's Done:**
  - **Reverse SIP Target Costing:** Employs `CompoundGrowthEngine` to calculate the exact monthly investment required to reach a future milestone:
    $$\text{Target}_{\text{FV}} = \text{Target}_{\text{PV}} \cdot (1 + i)^n$$
    $$\text{Monthly SIP} = (\text{Target}_{\text{FV}} - \text{Start} \cdot (1+r)^n) \cdot \frac{r}{(1+r)^n - 1}$$
  - **"One Investment $\rightarrow$ One Goal" Constraint:** Strict domain enforcement in `GoalInvestmentLinkRepository` and `GoalService`. When an asset is linked to Goal B, any existing link to Goal A is automatically cleared, preventing multi-goal double-counting.
  - **Monthly Capacity Bar:** Compares aggregate monthly SIP requirements across all active goals against the user's configured `monthlySavingsCapacity` in settings, alerting if over-committed.
  - **Contribution Tooling:** Supports Single Contributions, Withdrawals, and Multi-Mode Bulk Contributions (Per Goal, Split Percentage, and Split Fixed).

---

### 4.7 FIRE Planner (Financial Independence & Retire Early)
- **Status:** **Done (100%)**
- **Core Package:** `com.finora.fire.*`
- **Frontend:** `frontend/src/components/fire/FirePlanner.tsx`
- **How It's Done:**
  - **Standardized Baseline Assumptions:**
    - Pre-Retirement Nominal Return: **12.0% CAGR**
    - Post-Retirement Nominal Return: **8.0% CAGR**
    - Inflation Rate: **6.0% p.a.**
    - Safe Withdrawal Rate (SWR): **4.0%** (25x annual expenses) or conservative **3.33%** (30x annual expenses)
  - **Dual Calculation Modes:**
    - *Mode 1 (Years to FIRE):* Computes exact years and age to reach financial independence based on current corpus and monthly savings.
    - *Mode 2 (Required Savings):* Computes required monthly SIP to retire at a designated target age.
  - **Automated Data Ingress:** Pulls starting corpus from Net Worth Tracker or Portfolio Tracker, and auto-populates annual living expenses from Expense Tracker's `GET /api/v1/expenses/summary`.
  - **Visual Dual-Line Trajectory:** Renders Nominal Wealth Growth vs. Inflation-Discounted Real Purchasing Power curves.

---

### 4.8 Trip Manager
- **Status:** **Done (100%)**
- **Core Package:** `com.finora.trip.*`
- **Frontend:** `frontend/src/components/trip/TripManager.tsx`
- **How It's Done:**
  - **5-Tab Trip Architecture:** Overview, Plan (day-by-day timeline), Money (4 sub-tabs), Pack & Prep, and Checklist.
  - **AI-Assisted Itinerary Generator ("Trip Planner Pro"):** Two-pane wizard generating realistic day-by-day travel schedules, activities, estimated budgets, and packing lists based on destination and budget tier.
  - **Multi-Currency Travel Ingress:** Transactions can be entered in USD, EUR, VND, JPY, GBP, AED, etc., and are automatically converted to base INR using real-time FX rates.
  - **Smart Split Solver:** Supports Equal, Exact Amounts, Shares, and Percentage splits with family/dependent nesting.
  - **Minimal Settlement Graph Solver:** Calculates participant net balances ($\text{Paid} - \text{Share} = \text{Net}$) and resolves group debts in $O(N)$ minimal payment transfers.
  - **Zero-Budget Division Safeguards:** Hardened against $N/0$ arithmetic errors on trips with unallocated budgets.

---

### 4.9 Encrypted Vault (Secure Notes Locker)
- **Status:** **Done (100%)**
- **Core Package:** `com.finora.vault.*`
- **Frontend:** `frontend/src/components/vault/Vault.tsx`
- **How It's Done:**
  - **Zero-Knowledge Client-Side Cryptography:** Plaintext credentials never touch the backend server. The client browser derives a 256-bit symmetric AES key using `WebCrypto PBKDF2-SHA256` with 100,000 iterations and a unique user salt.
  - **AES-GCM-256 Encryption:** Every note is encrypted with a unique 96-bit random IV and authentication tag (`AES-GCM-256`), storing only ciphertext in `vt_notes`.
  - **Emergency Recovery Triad:** Issues exactly 3 cryptographically unique one-time backup codes (`#01, #02, #03`) at setup, allowing vault re-keying if the master password is forgotten.
  - **Anti-Bot Unlock Gate:** Visual SVG CAPTCHA challenge combined with password verifier hashing. Implements strict rate-limiting: 5 failed attempts trigger a 15-minute lockout.
  - **Shoulder-Surfing Defense:** Decrypted values are rendered in volatile memory only, featuring a timed 30-second secret reveal modal with auto-hide and automatic memory purge on lock/reload.

---

### 4.10 Suite-Wide Insights Engine
- **Status:** **Done (100%)**
- **Core Package:** `com.finora.insights.*`
- **Frontend:** `frontend/src/components/insights/SuiteInsightsView.tsx`
- **How It's Done:**
  - **4-Pillar Financial Health Score (0–100):**
    1. *Cash Flow Pillar (30% weight):* Savings rate, expense ratio, pending transaction drag.
    2. *Balance Sheet Solvency Pillar (30% weight):* Debt-to-asset ratio, liquid net worth cushion.
    3. *Goal Pacing Pillar (20% weight):* On-track goal ratio, monthly savings capacity alignment.
    4. *Retirement Freedom Pillar (20% weight):* Current FIRE progress percentage, retirement runway.
  - **Cross-Module Key Metrics Grid:** Displays unified financial metrics grouped by life area (`CASH_FLOW`, `DEBT`, `WEALTH`, `LIFE_ADMIN`) tagged with originating source module badges.
  - **Strategic Action Nudges Feed:** Generates context-aware recommendations with priority badges (`HIGH`, `MEDIUM`, `LOW`) and 1-click direct navigation to target modules.

---

### 4.11 Learn Content Hub (`/learn`)
- **Status:** **Done (100%)**
- **Data File:** `frontend/src/data/learnGuides.ts`
- **Frontend:** `frontend/src/components/learn/LearnCenter.tsx` & `LearnGuideDetail.tsx`
- **How It's Done:**
  - Educational guides covering 7 core financial disciplines (Digital Safety, Cash Flow, Amortization, Travel Splits, Portfolio Allocation, Net Worth, Goals, and FIRE).
  - **Cross-Tool Deep Linking via Query Params:** Clicking CTAs in Learn articles routes to the corresponding tool with pre-filled state parameters (e.g. `goal-manager?from=learn&name=₹50%20Lakh%20Goal&target=5000000...`, `fire-planner?from=learn&age=30&targetAge=45...`), automatically pre-populating calculator forms.

---

## 5. Verification & Test Suite Coverage

### Backend Automated Test Suite (`mvn test`)
- **Total Test Suites:** **46**
- **Passed:** **46** (100%)
- **Failures / Errors:** **0**
- **Coverage Areas:**
  - `FinoraCrossModuleEndToEndIntegrationTest` (Delink semantics, non-mutating GoalTags, EMI-NetWorth sync, Expense-FIRE data consumption).
  - `PortfolioIntegrationTest` (Asset inheritance, pricing strategies, Caffeine caching, valuation rollups).
  - `ExpenseTrackerIntegrationTest` (Month scoping, state transitions, summary contract).
  - `NetWorthIntegrationTest` (Balance sheet math, growth engine projections, solvency ratios).
  - `EmiIntegrationTest` (Amortization math, prepayment impact, CSV exporter).
  - `GoalIntegrationTest` (Reverse SIP costing, 1-to-1 investment link enforcement, capacity bar).
  - `FirePlannerIntegrationTest` (25x SWR math, Mode 1 & Mode 2 calculations, expense sync).
  - `TripIntegrationTest` (Itinerary timeline, multi-currency conversion, minimal debt solver).
  - `VaultIntegrationTest` (Zero-knowledge verifier, backup code redemption, rate-limiting).
  - `SuiteInsightsIntegrationTest` (4-pillar 0-100 composite scoring, nudge generator).

### Frontend Production Build (`npm run build`)
- **Compiler:** TypeScript + Vite
- **Build Status:** **Success (0 errors, clean bundle compilation)**
- **Asset Size:** Cleanly minified and gzip-optimized CSS and JS bundles.

---

## 6. What Is Left / Future Roadmap (Optional Post-Launch Enhancements)

All core features, business rules, and modules specified in the Master Reference and Westro Master Document are **100% Complete and Feature-Complete**. 

The following items are optional future enhancements for subsequent release cycles (Post-V1 Backlog):

| Item | Area | Description | Priority |
|---|---|---|---|
| **Account Aggregator (AA) Integration** | Portfolio / Expense | Direct Open Banking automated fetch via Setu / OneMoney AA ecosystem for automatic bank transaction feeds. | Low / Post-V1 |
| **OAuth2 Social Sign-In** | Auth | Add Google and Apple social sign-in buttons alongside the existing custom credentials and 1-click primary demo login. | Low / Post-V1 |
| **Native Mobile Packaging** | Client | Package the responsive Vite/Tailwind web app into native iOS/Android binaries via Capacitor / React Native. | Low / Post-V1 |
| **Automated PDF Trip Report Generator** | Trip Manager | Export complete multi-day itinerary and expense breakdown as a downloadable PDF document. | Low / Post-V1 |

---

## 7. Change Log & Major Milestones

| Date | Contributor | Major Milestone / Delivered Work |
|---|---|---|
| **2026-10-04** | Finora Core | **Comprehensive Master Documentation & Verification**: Consolidated complete technical architecture, mathematical formulas, security protocols, and module specifications into `PROJECT.md`. |
| **2026-10-03** | Finora Core | **Westro Master Feature & Content Doc Alignment**: Enforced "one investment $\rightarrow$ one goal" constraint; built Prepay vs Invest Arbitrage Analyzer with dynamic ROI slider; implemented Learn Hub URL parameter deep linking; streamlined primary demo login. 46/46 backend tests passing. |
| **2026-09-30** | Finora Core | **End-to-End Cross-Module Integration Suite**: Implemented `FinoraCrossModuleEndToEndIntegrationTest.java` verifying cross-track contracts, delink semantics, non-mutating GoalTags, and EMI-NetWorth sync. |
| **2026-09-30** | Finora Core | **Suite-Wide Insights Engine**: Created 4-pillar composite Financial Health Score (0–100), cross-module metrics grid, asset distribution charts, and strategic action nudges feed. |
| **2026-09-29** | Finora Core | **Live Multi-API Pricing & Caffeine Caching Layer**: Integrated Yahoo Finance, AMFI, Gold-API, and Open-ER feeds with 5-minute background refresh caching. |
| **2026-09-14** | Finora Core | **FIRE Planner & Goal Manager Feature-Complete**: Built dual-mode FIRE calculator and Reverse SIP goal engine consuming shared `CompoundGrowthEngine`. |
| **2026-09-07** | Finora Core | **Net Worth Tracker & Portfolio Tracker Feature-Complete**: Built consolidated balance sheet with 3-scenario growth projections and multi-asset portfolio tracker. |
| **2026-09-02** | Finora Core | **EMI Manager, Trip Manager, Vault, and Expense Tracker Feature-Complete**: Built reducing balance amortization engine, multi-currency trip splitter, zero-knowledge AES-GCM vault, and budget month expense tracker. |
| **2026-09-01** | Finora Core | **Phase 0 Shared Foundation**: Scaffolding, JWT auth, base INR Currency Service, `LinkableEntity` universal linking, and shared UI component library. |

---

## 8. Resolved Technical Decisions

1. **Delink Semantics:** Delinking any linked record converts it into an independent standalone `MANUAL` copy with its current frozen values (`isLinked = false`, `sourceModule = MANUAL`, `sourceEntityId = null`), preserving calculation integrity and enabling free edits.
2. **Reconciliation of Independent Health Scores:** Intentional multi-tier design. Expense Tracker calculates cash velocity and savings rate (0–100); Net Worth Tracker calculates solvency and balance sheet leverage (0–100); Suite-Wide Insights calculates the master 4-pillar composite score (0–100).
3. **GoalTag Non-Mutating Balance Rule:** Expense transactions tagged with a `linkedGoalId` serve reporting associations only and never alter goal `currentValue`. Goal balances are driven exclusively by explicit contributions and linked portfolio holdings.
4. **Standardized FIRE Assumptions:** 12.0% Pre-Retirement CAGR, 8.0% Post-Retirement CAGR, 6.0% Inflation, and 4.0% SWR (25x annual living expenses).
5. **Base Currency DB Storage:** All monetary figures across all modules are stored in **INR**. Foreign currencies (USD, EUR, VND, JPY) are converted at ingress using live mid-market rates and presented dynamically in the user's selected display currency.
