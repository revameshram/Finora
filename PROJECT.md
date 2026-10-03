# Finora — Project Tracker

> Living doc. Update this alongside every merged module/feature — this is the source of truth for "what's actually done" vs. the Master Reference (UX/data-model spec) and Team Build Plan (who/when).

**Last updated:** 2026-10-03
**Owners:** Finora Engineering

---

## 1. Overview

Finora is a personal finance suite reverse-engineered from Westro, built as two independent developer tracks (see Team Build Plan). 8 modules total, split by data-dependency direction, not feature count.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Backend | Spring Boot 3.x |
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Database / Auth | PostgreSQL / Supabase, JWT auth |
| Package convention | `com.finora.<module>.*` |

*(Adjust here if any of these shift during build — this table should always reflect what's actually in the repo, not the plan.)*

---

## 3. Phase 0 — Shared Foundation

Owner: Alok (doing all Phase 0 init work solo — see §7).

| Item | Status | Notes |
|---|---|---|
| Repo/project scaffolding | Done | Monorepo layout with Spring Boot 3.3.4 (Java 21) & React 18/TS/Vite/Tailwind, module packages/folders created |
| Auth/JWT (issuance + validation) | Done | Decoupled issuance (`com.finora.common.auth`) + stateless JWT validation filter + seeded dummy users |
| Shared Profile/Workspace table | Done | `user_profiles` table/JPA entity + Supabase/Postgres & H2 migration schema |
| Currency service (baseCurrency + display conversion) | Done | Live API rates (`open.er-api.com`), 1h TTL cache, single baseCurrency (INR) DB storage, two-way conversion & rich frontend metadata |
| Universal linking mechanism (`isIncluded`/`isLinked`/`sourceModule`) | Done | Base `@MappedSuperclass LinkableEntity`, `Linkable` interface, `LinkingService`, frontend `LinkedBadge` & `IncludeToggle`, Delink semantics resolved |
| Shared frontend components (toast, insights-card, empty-state, onboarding-drawer) | Done | Toast notification system (`useToast`), `InsightsCard` (4 themes + metrics), `EmptyState`, `OnboardingDrawer` (steps + checklist) |
| Expense Tracker Summary API contract (spec/mock) | Done | Fulfilled via real `ExpenseService` & `ExpenseController` (`/api/v1/expenses/summary` & `/api/v1/expenses/goal-linked`) |
| Net Worth Liabilities/Assets API contract (spec/mock) | Done | Fulfilled via real `NetWorthLiabilityService` & `NetWorthController` (`GET/POST /api/v1/networth/liabilities`) |

---

## 4. Module Status

### Track A — Wealth & Growth (Reva)

| Module | Status | Depends On | Notes |
|---|---|---|---|
| Portfolio Tracker | Feature-complete | — | Ships first; Net Worth needs it as linkable source |
| Net Worth Tracker | Done | Portfolio Tracker | Owns shared growth engine (compound growth + FV-of-annuity) |
| Goal Manager | Done | Net Worth, Portfolio, Expense Tracker (real API) | Reuses growth engine, Portfolio links & real Expense contract |
| FIRE Planner | Done | Net Worth, Portfolio, Expense Tracker (real API) | Reuses growth engine, Portfolio links & real Expense contract |

### Track B — Cash Flow & Life Admin (Alok)

| Module | Status | Depends On | Notes |
|---|---|---|---|
| Expense Tracker | Done | — | Cash-flow backbone + DB-backed Summary API contract fulfilled |
| Vault | Done | — | Zero-knowledge client-side encryption + timed reveal + bot-throttled unlock gate |
| Trip Manager | Done | — | Fully self-contained multi-currency travel planner & group ledger |
| EMI Manager | Done | Net Worth Tracker (liabilities contract), Expense Tracker (internal) | Institutional-grade reducing balance amortization engine, prepayment sandbox, Net Worth sync & Expense cash-flow matching |

### Joint

| Item | Status | Notes |
|---|---|---|
| Suite-Wide Insights tab | Done | Financial Health Overview (0-100 composite score & 4 pillars), cross-module Key Metrics (life-area grouped + module badges), Asset Allocation distribution, and Strategic Recommendations & Nudges feed |

---

## 5. Feature-Level Detail

### Expense Tracker
**Status:** Done
**Implemented:**
- [x] Budget Month scoping (`YYYY-MM`) with month navigation toolbar
- [x] "Copy Month" bulk duplication utility (replicates recurring income, transactions as Pending, and tasks as TODO)
- [x] Income Sources ledger (Name, Amount in base INR, Payment Instrument, CRUD APIs)
- [x] Transactions ledger with 17 categories, Amount in base INR, Payment method, Payment date, and search/category filters
- [x] State Machine: `Pending` vs. `Done` settlement toggling (affects Cash Flow vs Net Position metrics)
- [x] Calculation rollup `isIncluded` toggle (allows keeping transactions without inflating totals)
- [x] Goal Manager linking (`linkedGoalId` / GoalTag reporting association without balance alteration)
- [x] Monthly Checklist Tasks (TODO, IN_PROGRESS, DONE)
- [x] Monthly Notes (freeform, timestamped, append-only log)
- [x] Summary Tab with interactive Category Breakdown Donut + Settlement Status Donut
- [x] Financial Insights Panel (Health Score 0–100, Savings Rate, Expense Ratio, Pending Drag, 6-Month Emergency Fund Target, Cash Flow Velocity, and Advisory cards)
- [x] Real Database-Backed Cross-Track Summary API Contract (`GET /api/v1/expenses/summary` and `GET /api/v1/expenses/goal-linked`)

### Vault
**Status:** Done
**Implemented:**
- [x] Zero-knowledge client-side encryption (`WebCrypto PBKDF2-SHA256` 100k rounds + `AES-GCM-256` with 96-bit random IV)
- [x] Dedicated first-run Vault Master Password setup with verifier hashing (password never transmitted/stored in retrievable format)
- [x] Exactly 3 one-time emergency backup recovery codes (#01, #02, #03) issued once at setup
- [x] Two-factor Unlock Gate with master password verifier + embedded dynamic visual SVG CAPTCHA challenge (Option 1 bot-throttling)
- [x] Account rate-limiting & 15-minute lock after 5 consecutive failed unlock attempts
- [x] Session-based lock state with in-memory key purge on lock/reload
- [x] Biometric Unlock & Device Protection optional toggles (§16.8)
- [x] One-time backup code redemption recovery flow to re-key forgotten master passwords
- [x] Secure Note Create / Edit with client-side encryption and 8 category tags (`Finance`, `Official`, `Personal`, `Work`, `Social`, `Banking`, `Medical`, `Custom`)
- [x] Timed auto-hide Secret Value reveal modal with 30-second countdown, visual progress bar, manual hide, and one-click copy (§16.10)
- [x] Client-side search scoped to note labels and descriptions
- [x] Reused shared `EmptyState` and `OnboardingDrawer` components with custom Vault usage tips

### Trip Manager
**Status:** Done
**Implemented:**
- [x] Trip Creation: Manual lightweight form + AI-assisted "Trip Planner Pro" 2-pane itinerary generator with destination, dates, budget tier, and preview
- [x] 1-Click "Try with Sample Data" seeder (§16.14 8-day Vietnam fixture with ₹4,50,000 budget and ₹3,26,150 spend across 8 travelers)
- [x] 5-Tab Trip Structure: Overview, Plan, Money (4 sub-tabs), Pack & Prep, Checklist
- [x] Overview Tab: 4 deep-link shortcut tiles (Next on Plan, Budget Status, Open Checklist, Luggage) + Participant management with single-level family/dependent nesting (`parentParticipantId`)
- [x] Plan Tab: Day-by-day chronological itinerary timeline, category badges (Flight, Hotel, Activity, Food, Transit, Sightseeing), estimated costs, assigned traveler badges, rich descriptions, and route map waypoints preview
- [x] Money Tab persistent header: Real-time spend meter, ₹ budget left, % used, progress bar
- [x] Money Sub-Tab 1 (Budget): Overall budget cap editor, 7 fixed travel category budgets, collapsible Budget vs Plan table, and 3 summary cards (Projected Reality, Spending Status, Market Allocations)
- [x] Money Sub-Tab 2 (Expenses): 4-tab Add Expense modal (Basic, Splits, Pay, Notes), multi-currency ingress (USD, EUR, VND, AED converted to base INR), and Smart Split Solver (By-Shares and By-Percentage modes)
- [x] Money Sub-Tab 3 (Settle): Participant net balances matrix (Paid vs Share $\rightarrow$ Net Balance) + 1-click suggested minimal debt transfers with settlement payment recorder
- [x] Money Sub-Tab 4 (Insights): Spending breakdown toggle (Categories vs Travelers), Highlights & Advisory card, and collapsible Full Analysis (Spending Velocity ₹/day projection, Cost Efficiency metrics, Payment Coverage)
- [x] Safeguard all percentage and velocity calculations against $N/0$ divide-by-zero on trips with zero budget set (§16.2 / §16.12)
- [x] Pack & Prep Tab: Quick-Add templates (`Basic Essentials`, `Beach Trip`, `Business`, `Cold Weather`), manual item input with 7 categories, and checkable packing progress bar
- [x] Checklist Tab: Priority-badged tasks (`High`, `Medium`, `Low`) with due dates and participant assignees
- [x] Container & Header Bar: 6-action header (Back, Edit, AI Regenerate Ideas, Export Report, Delete, Onboarding Guide)

### EMI Manager
**Status:** Done
**Implemented:**
- [x] Dedicated Amortization Math Engine (`EmiCalculationEngine`): reducing balance formula $E = P \cdot r \cdot \frac{(1+r)^n}{(1+r)^n - 1}$ completely isolated from compound growth
- [x] Loan Management: CRUD with 7 loan categories (`Home Loan`, `Car Loan`, `Personal Loan`, `Education Loan`, `Gold Loan`, `Business Loan`, `Other Debt`) and status tracking
- [x] Cross-Track Net Worth Tracker Contract Integration: Automatically pushes loan liability records to `POST /api/v1/networth/liabilities` with `sourceModule = EMI_MANAGER` and `isLinked = true`
- [x] Internal Expense Tracker Cash-Flow Reconciliation: Discovers and reconciles recurring bank EMI debits directly from `et_transactions`
- [x] Full Amortization Explorer: Calendar-year accordions with month-by-month Principal, Interest, Prepayment, and Closing Balance breakdown + One-click CSV export
- [x] Prepayment Simulator & Optimization Sandbox: Live sliders simulating lump sums, annual bonuses, or extra monthly payments, comparing **Tenor Reduction** (maximum interest savings) vs **EMI Reduction** (cash flow relief)
- [x] Prepayments Ledger: Add permanent lump sums and recurring prepayment records with automatic schedule recalculation
- [x] Standalone EMI Calculator: Pure mathematical sandbox with interactive loan principal, interest rate, and tenure sliders with visual Principal vs Interest breakdown
- [x] 1-Click Sample Data Seeder: Seeds realistic Indian loans (₹50,00,000 HDFC Home Loan @ 8.5% with ₹5L prepayment + ₹8,50,000 ICICI Auto Loan @ 9.2%)
- [x] Loan Portfolio Dashboard: 4 KPI summary cards (Total Debt, Monthly Outflow, Interest Payable, Avg Rate) and loan repayment progress meters

### Net Worth Tracker
**Status:** Done
**Implemented:**
- [x] Three-Tab Consolidated Dashboard (Assets, Liabilities, Summary tabs)
- [x] Widened Category Enums across 9 Asset categories (`CASH_BANK`, `INVESTMENTS`, `CRYPTO`, `GOLD_SILVER`, `REAL_ESTATE`, `VEHICLES`, `RETIREMENT_ACCOUNTS`, `BUSINESS_ASSETS`, `OTHER`) and 7 Liability categories (`HOME_LOAN`, `CAR_LOAN`, `PERSONAL_LOAN`, `CREDIT_CARD`, `STUDENT_LOAN`, `BUSINESS_LOAN`, `OTHER_DEBT`)
- [x] Real Database-Backed Cross-Track Liabilities API Contract Fulfillment (`POST /api/v1/networth/liabilities` and `GET /api/v1/networth/liabilities` receiving loans pushed by EMI Manager)
- [x] Shared Growth Engine Library (`CompoundGrowthEngine`) owning compound growth ($FV = PV(1+r)^n$), SIP annuity math ($FV_{\text{annuity}}$), real purchasing power discounting, and Reverse SIP target costing
- [x] Portfolio-Linked Asset Integration with Flat Growth Projection Nuance (Portfolio holdings included in present balance sheet but held flat at 0% CAGR in Net Worth growth projections)
- [x] 3-Scenario Growth Projection Sandbox (Conservative 5%, Moderate 10%, Aggressive 15% CAGR with Rule-of-72 doubles-in-years hints)
- [x] Financial Health & Insights Engine (Health Score 0-100, Debt-to-Asset ratio, Liquidity ratio, Largest Asset/Liability, and contextual recommendation cards)
- [x] 1-Click Sample Data Seeder (populates realistic Indian assets & liabilities: HDFC Savings, ICICI FD, Whitefield Apartment, SGB Gold, HDFC Home Loan, Credit Card)
- [x] Integration Test Suite (`NetWorthIntegrationTest` verifying asset/liability CRUD, EMI sync contract, growth projections, health scores, and growth engine math)
- [x] Full End-to-End Frontend UI Workbench (`NetWorthTracker.tsx`) with Assets, Liabilities, and Summary tabs, interactive sample data seeder, delink capabilities, `IncludeToggle`, portfolio flat growth banners, 3-scenario growth projections sandbox, category breakdown meters, top holdings ranking, and financial health insights panel
- [x] Full integration into Executive Workspace Shell (`App.tsx` and `WorkspaceHub.tsx`)

### Goal Manager
**Status:** Done
**Implemented:**
- [x] Header KPIs (Total Saved, Target Amount, Inflation-Adjusted Target, Overall Progress %, Active/OnTrack/Behind counts, Required Monthly Rate, Next Due milestone)
- [x] Capacity Bar comparing required monthly savings rate vs user-set Monthly Savings Capacity with over-capacity alert banner and settings shortcut
- [x] Allocation Donut & category breakdown rollups
- [x] Per-Goal Summary Cards Grid with progress bars, required rates, due days, and direct action shortcuts
- [x] Clickable Alerts & Nudges Feed shortcutting directly into detail drawer or settings modal
- [x] Goal Manager Settings Modal (Monthly capacity, behind-schedule lag threshold %, default inflation rate %)
- [x] Goal Detail Drawer/Modal (PV vs Inflation-Adjusted FV banner, history log, actual vs planned trajectory table, milestones checklist)
- [x] 4-Tab Goal Creation Wizard (Basics, Target & Plan, Funding, Link Investments from Portfolio Tracker)
- [x] Single Contribution & Withdrawal Modal
- [x] Multi-mode Bulk Contribution Tooling (Per Goal, Split %, Split Fixed sum-enforced)
- [x] Enforced Domain Rule: GoalTag transactions from Expense Tracker associate for reporting only and never mutate goal balance
- [x] Reused `CompoundGrowthEngine` library for reverse SIP target costing & inflation compounding ($FV = PV(1+r)^n$)
- [x] Integration Test Suite (`GoalIntegrationTest` verifying math engine, CRUD, bulk contribution, capacity alerts, portfolio linking, and GoalTag non-mutating reporting behavior)
- [x] Full integration into Executive Workspace Shell (`App.tsx` and `WorkspaceHub.tsx`)

### FIRE Planner
**Status:** Done
**Implemented:**
- [x] Dual-mode retirement calculator (Mode 1: Target-Years-to-FIRE $\rightarrow$ Computed Timeline/Age; Mode 2: Required Monthly Savings $\rightarrow$ Computed Monthly SIP)
- [x] Two-column layout with Left Input Parameters Form & Mode Rail and Right Persistent Sidebar (FIRE Number Card, Active Mode Result Card, About FIRE Card)
- [x] Reused `CompoundGrowthEngine` library from Net Worth Tracker (`com.finora.common.growth`) for compounding ($FV = PV(1+r)^n$) and reverse SIP target costing
- [x] Resolved return-assumption inconsistency with Finora standardized baseline: 12% Pre-Retirement CAGR, 8% Post-Retirement CAGR, 6% Inflation, 4% SWR (25x multiple)
- [x] Starting corpus resolution supporting Net Worth Tracker auto-sync, Portfolio Tracker auto-sync, or Manual override
- [x] Annual retirement expenses auto-population from Expense Tracker Summary API contract (`GET /api/v1/expenses/summary`)
- [x] Summary Tab with dual-line Savings Growth Projection chart (Nominal Wealth vs Real Purchasing Power) and Progress bar chart
- [x] 1-Click Sample Data Seeder (Age 32, ₹25L starting corpus, ₹60k monthly savings, ₹12L annual spend)
- [x] Integration Test Suite (`FirePlannerIntegrationTest` verifying 25x SWR math, Mode 1 timeline, Mode 2 required savings, corpus sync, and Expense summary contract integration)
- [x] Full integration into Executive Workspace Shell (`App.tsx` and `WorkspaceHub.tsx`)

### Suite-Wide Insights
**Status:** Done
**Implemented:**
- [x] Financial Health Overview: Composite 0–100 score reconciling 4 independent pillars — Cash Flow (30%), Balance Sheet Solvency (30%), Goal Pacing (20%), and Retirement Freedom (20%)
- [x] Cross-Module Key Metrics Grid grouped by life area (`CASH_FLOW`, `DEBT`, `WEALTH`, `LIFE_ADMIN`) with health indicator badges and originating source module badges
- [x] Interactive Life Area filtering pills (`All`, `Cash Flow`, `Debt & Loans`, `Wealth & Investments`, `Life Admin`)
- [x] Asset Allocation Distribution breakdown across Equities, Mutual Funds, Fixed Deposits, Precious Metals, and Real Estate
- [x] Strategic Cross-Module Action Nudges feed with urgency badges (`HIGH`, `MEDIUM`, `LOW`), originating source tags, and one-click direct jump CTAs to target modules
- [x] Executive Synthesis advisory banner providing top-level AI diagnostic insights
- [x] Backend Suite Insights Layer (`com.finora.insights`) with `SuiteInsightsService`, `SuiteInsightsController` (`GET /api/v1/insights/suite`), and `SuiteInsightsIntegrationTest`
- [x] Frontend Component (`SuiteInsightsView.tsx`) wired into `WorkspaceHub.tsx` under the Suite-Wide Insights tab

**In progress:**
- None

**Not started:**
- None — **All 8 modules + Suite-Wide Insights are now 100% COMPLETE!**

**On hold / deferred:**
- None

**Known issues / tech debt:**
- None. Verified with 100% backend test pass rate across all 42 test suites and 0 frontend build errors.

---

## 6. On Hold / Deferred

| Item | Reason | Revisit when |
|---|---|---|
| — | — | — |

---

| Date | Who | What changed |
|---|---|---|
| 2026-10-03 | Finora Core | **Westro Master Feature & Content Doc Alignment & Completion**: (1) Audited all 8 core modules (§2.1–§2.8) and Learn Content Hub (§3) against `westro-master-doc.md`; (2) Enforced "one investment → one goal" constraint across Goal Manager (`GoalInvestmentLinkRepository` and `GoalService`); (3) Added interactive **Prepay vs. Invest Comparison / Arbitrage Visualizer** in EMI Manager (`PrepaymentSimulatorTab.tsx`) with dynamic expected equity return slider and strategy verdict; (4) Added Learn Content Hub deep-linking via query parameters pre-filling Goal Manager and FIRE Planner forms (`App.tsx`, `GoalManager.tsx`, `FirePlanner.tsx`, `learnGuides.ts`); (5) Verified with 100% backend test pass rate across 46/46 suites (`mvn test`) and 0 frontend build errors (`npm run build`). |
| 2026-09-30 | Finora Core | **End-to-End Cross-Module Integration Test Suite**: Implemented and executed comprehensive multi-module integration testing (`FinoraCrossModuleEndToEndIntegrationTest.java`). Verified all 4 key cross-track workflows: (1) Portfolio-linked Net Worth asset delink semantics (freezing valuation at ₹2,50,000, resetting to `MANUAL` and `isLinked=false` with independent editability); (2) Goal-linked Expense transaction association with verified non-mutating reporting rule (transactions tagged to goals never mutate `Goal.currentValue`); (3) EMI Manager loan creation and automated synchronization into Net Worth liabilities (`POST /api/v1/networth/liabilities`) with prepayment schedule recalculation; (4) Real Expense Tracker contract data consumption by FIRE Planner (annual retirement expenses auto-populating from live cash flow) and Goal Manager capacity monitoring. All 46 backend test suites passed (0 failures). |
| 2026-09-30 | Finora Core | **Suite-Wide Insights Engine & End-to-End Cross-Module Synthesis**: Built and integrated the complete Suite-Wide Insights layer synthesizing operational live data across all 8 modules. (1) Backend `com.finora.insights` package aggregating Cash Flow, Solvency, Goal Pacing, and Retirement Freedom into a 0-100 composite Financial Health Score; (2) Cross-module Key Metrics grid tagged with source module badges; (3) Asset Allocation Distribution breakdown; (4) Strategic Action Nudges feed with direct module routing; (5) Frontend `SuiteInsightsView.tsx` integrated into `WorkspaceHub.tsx`; (6) 100% backend integration test pass rate (42/42 suites) and clean frontend production build. **Entire Finora Suite is now 100% COMPLETE!** |
| 2026-09-29 | Finora Core | **Live Multi-API Asset Pricing & Caffeine Caching Layer**: Implemented live real-world external financial data fetching across all asset classes with multi-provider fallback resilience and 5-minute Caffeine caching: (1) Stocks & ETFs via Yahoo Finance v8 query1 & query2 with realistic browser headers; (2) Mutual Funds via AMFI/`mfapi.in` latest and full NAV endpoints; (3) Metals (Gold, Silver, Platinum) via `api.gold-api.com` and `goldprice.org` with dynamic INR conversion via live exchange rates; (4) Currency exchange rates via `open.er-api.com`, `frankfurter.dev`, and `exchangerate.fun`; (5) Centralized `CacheConfig` with `@EnableCaching`, `@EnableScheduling`, and proactive 5-minute background refresh cycles; (6) Dynamic symbol search for MFs and Equities; (7) Goal Manager live portfolio valuation linkage. |
| 2026-09-29 | Finora Core | **UI Consistency, Logo Branding & Experience Polish**: (1) Created bespoke Finora SVG vector logo (`FinoraLogo.tsx`) and vector favicon (`favicon.svg`); (2) Unified warm stone/amber design system (`#FAFAF9`, `#1C1917`, `#B88728`/`#B45309`, `#E7E5E4`) replacing black buttons and dark widgets; (3) Cleaned user-facing UI of internal developer/track labels across all views; (4) Implemented FIRE Planner Summary page; (5) Linked Net Worth shortcuts directly to EMI Manager and Portfolio Tracker; (6) Verified 100% test pass rate across all 41 test suites and 0 frontend build errors. |
| 2026-09-14 | Reva | Phase 1 Track A: FIRE Planner module fully built end-to-end (Entities `fp_*`, `FirePlannerService` consuming shared `CompoundGrowthEngine` for 4% SWR retirement math & reverse SIP calculations, `FirePlannerController`, `FirePlannerIntegrationTest`, 2-column layout, Mode 1 & Mode 2 calculation modes, standardized Finora baseline assumptions, Expense contract auto-population, dual-line growth projection chart, and frontend workbench `FirePlanner.tsx` integrated into `App.tsx` / `WorkspaceHub.tsx`). **FIRE Planner is now FEATURE-COMPLETE & DONE! All 4 Track A modules are now 100% COMPLETE!** |
| 2026-09-14 | Reva | Phase 1 Track A: Goal Manager module fully built end-to-end (Entities `gm_*`, `GoalService` consuming shared `CompoundGrowthEngine` for inflation compounding & reverse SIP target costing, `GoalController`, `GoalIntegrationTest`, capacity bar & pace monitoring, 4-tab wizard, single/bulk contribute modals, GoalTag reporting non-mutating rule, and frontend workbench `GoalManager.tsx` integrated into `App.tsx` / `WorkspaceHub.tsx`). **Goal Manager is now FEATURE-COMPLETE & DONE!** |
| 2026-09-07 | Reva | Phase 1 Track A: Net Worth Tracker & Shared Growth Engine Library fully built end-to-end (Entities `nw_*` extending `LinkableEntity`, widened category enums, real DB liabilities contract fulfillment receiving loans pushed by EMI Manager, `CompoundGrowthEngine` library for compound growth & SIP annuity math, `NetWorthAnalyticsService` with 3-scenario projections & portfolio flat growth nuance, `NetWorthController`, and `NetWorthIntegrationTest`). **Net Worth Tracker is now FEATURE-COMPLETE!** |
| 2026-09-07 | Reva | Phase 1 Track A: Portfolio Tracker module fully built end-to-end (Entities `pf_*` extending `LinkableEntity`, `PortfolioAssetService`, `PortfolioAnalyticsService`, `PortfolioPricingService` with Strategy+Factory+Caffeine pattern for Yahoo Finance / MF API / Metals, `PortfolioController`, `PortfolioIntegrationTest` passing, Dashboard rollups, Growth Outlook 1Y/3Y/5Y projections, Equity Drawdown Check, and sample portfolio seeder). **Portfolio Tracker is now FEATURE-COMPLETE!** |
| 2026-09-02 | Alok | Phase 1 Track B: EMI Manager module fully built from first principles (Entities `em_loans`, `em_loan_prepayments`, `em_loan_emi_logs`, `EmiCalculationEngine`, `EmiService`, `EmiController`, `EmiIntegrationTest` 25/25 tests passing, Net Worth liability contract integration, Expense Tracker transaction matching, Amortization explorer with CSV export, Prepayment sandbox, Standalone EMI calculator, and router integration). **Track B is now 100% COMPLETE!** |
| 2026-09-02 | Alok | Phase 1 Track B: Trip Manager module fully built end-to-end (Entities `tr_trips`, `tr_participants`, `tr_plan_stops`, `tr_category_budgets`, `tr_expenses`, `tr_expense_splits`, `tr_expense_payments`, `tr_packing_items`, `tr_checklist_items`, `TripService`, `TripAiPlannerService`, `TripController`, `TripIntegrationTest` 21/21 suite tests passing, 5-tab UI with 4 Money sub-tabs, Smart Split solver, debt minimization matrix, zero-division safeguards, Vietnam sample seeder, and router integration) |
| 2026-09-02 | Alok | Phase 1 Track B: Vault module fully built end-to-end (Entities `vt_vault_profiles`, `vt_backup_codes`, `vt_notes`, `vt_device_keys`, `CaptchaService`, `VaultService`, `VaultController`, `VaultIntegrationTest`, WebCrypto AES-GCM-256 client crypto engine, Setup/Unlock/Timed 30s Reveal/Settings UI, and router integration) |
| 2026-09-02 | Alok | Phase 1 Track B: Expense Tracker module fully built end-to-end (Entities `et_income_sources`, `et_transactions`, `et_tasks`, `et_notes`, Service calculations, Controller, Integration tests, Frontend tabs, and real DB-backed Summary API contract fulfillment) |
| 2026-09-02 | Alok | Shared Design System & UI Package Redesign: Bespoke Obsidian Pine (`#0E1B15`), Alpine Linen (`#F3F6F3`), Burnished Brass (`#B88728`) palette; Plus Jakarta Sans & Fraunces typography; 1px structural gridlines (`#D2DDD4`); refactored `Toast`, `InsightsCard`, `EmptyState`, `OnboardingDrawer`, `CurrencySelector`, `CurrencyInput`, `LinkedBadge`, `IncludeToggle`, and the dual-ledger Workspace Shell |
| 2026-09-01 | Alok | Phase 0.6: Cross-track API contracts (OpenAPI 3.0 YAML spec `contracts/cross-track-contracts.yaml`, `ExpenseContractMockController` for Track A consumers, `NetWorthContractMockController` for Track B consumers) |
| 2026-09-01 | Alok | Phase 0.5: Shared frontend component package (`Toast` & `ToastContext` / `useToast()`, `InsightsCard` with 4 theme variants & metrics, `EmptyState` with CTAs, `OnboardingDrawer` with step-by-step guides & checkable tips checklist) |
| 2026-09-01 | Alok | Phase 0.4: Universal linking mechanism (`LinkableEntity` `@MappedSuperclass`, `Linkable` interface, `SourceModule` enum, `LinkingService`), frontend `LinkedBadge` & `IncludeToggle`, Delink semantics decision resolved |
| 2026-09-01 | Alok | Phase 0.3: Live Currency Service with Open ER API integration, 1-hour TTL in-memory caching, two-way conversion (`toBase` for DB storage in INR & `fromBase` for display), frontend `CurrencyContext`, `CurrencySelector` with country names/flags, `CurrencyInput`, `<Money />` component |
| 2026-09-01 | Alok | Phase 0.2: Auth/JWT issuance & validation end-to-end, `user_profiles` entity & migration schema, Supabase environment setup, frontend AuthContext & API client |
| 2026-09-01 | Alok | Phase 0.1: Repo scaffolding, Spring Boot 3.3.4 (Java 21) backend & React 18/TS/Vite frontend skeletons, com.finora.<module>.* package structure for all 8 modules + shared modules |
| — | Alok | Doing all Phase 0 initialization solo (Alok & Reva can't work simultaneously) |

---

## 8. Open Questions / Decisions Pending

- [x] **Delink semantics**: Resolved in Phase 0.4 — Delink converts a linked record into an independent standalone MANUAL copy with its current frozen values, setting `isLinked=false`, `sourceModule=MANUAL`, `sourceEntityId=null`, keeping the record fully editable and preserving calculation integrity.
- [x] **Reconcile three scoring layers**: Resolved in Phase 1 Track A — Intentional multi-tier design. Expense Tracker measures cash flow velocity/savings rate (0-100), Net Worth Tracker measures balance sheet leverage/liquidity (0-100), and Suite-Wide Insights tab aggregates cross-module health into a composite suite score.
- [x] **GoalTag non-mutating balance rule**: Resolved in Phase 1 Track A (Goal Manager) — GoalTag transactions tagged from Expense Tracker serve reporting associations only and never alter goal `currentValue`. Goal balance is driven exclusively by manual funding contributions (`GoalContribution`) and linked Portfolio holdings.
- [x] **FIRE return-assumption inconsistency**: Resolved in Phase 1 Track A (FIRE Planner) — Standardized Finora baseline assumptions: 12.0% Pre-Retirement CAGR, 8.0% Post-Retirement CAGR, 6.0% Inflation, and 4.0% Safe Withdrawal Rate (25x multiple).

---

## 9. Reference Docs

- `Finora_Master_Reference.docx` — module UX/data-model detail, source of truth for feature spec
- `Finora_Team_Build_Plan.docx` — who builds what, in what order, API contracts, timeline
