# Finora — Sync Log

> Shared changelog between Alok (Track B) and Reva (Track A). Since you're not building simultaneously, this is how the other person catches up before their session: what changed, why, and — most importantly — whether it touches the other track.

**How to use:** add an entry every session, newest on top. Always fill in "Affects other track?" honestly — that's the field that saves the handoff.

---

## Entry Template

```
### YYYY-MM-DD — <Name> — <Track A/B>

**Worked on:** <module/area>

**Changes made:**
-

**Affects other track?** Yes / No
- If yes — what changed and what the other person needs to do about it:
  -

**Contract impact?** (Expense Tracker Summary API / Net Worth Liabilities-Assets API / linking mechanism / shared components / none)
- If a shared contract or shared piece changed shape, spell out the exact diff:
  -

**Blocked on:**
-

**Next session:**
-
```

---

## Log

### 2026-09-02 — Alok — Westro Integration & Learn Center

**Worked on:** Westro Persona Avatars, Interactive 8-Guide Learn Center (`/learn`), and Landing Page elevation.

**Changes made:**
- **Assets (`frontend/public/avatars/`):**
  - Transferred 6 persona avatars (`profile-child-*.webp`, `profile-mid-adult-*.webp`, `profile-older-*.webp`) and illustration graphics from scraped Westro.
- **Learn Center (`frontend/src/components/learn/`):**
  - Built `LearnCenter.tsx` with search, category filtering (`All`, `Cash Flow`, `Growth`, `Security`), and 8 deep-dive educational guides in `learnGuides.ts`:
    1. Digital Safety & Vault Cryptography (PBKDF2-SHA256, AES-GCM-256)
    2. Cash Flow Mastery & Budget Scoping (50/30/20, Pending drag, Emergency runway)
    3. Loan Schedules & Prepayment Acceleration (Reducing balance math, 1-extra-EMI rule)
    4. Group Travel Splits & Multi-Currency Economics (Base currency anchor, Settle matrix)
    5. Multi-Asset Portfolio Architecture (Core & Satellite, Global diversification)
    6. Consolidated Balance Sheet & Net Worth (Liquid vs Illiquid, Debt-to-Asset ratio)
    7. Milestone Goals & Reverse SIP Engineering (Inflation-adjusted target costing)
    8. Retirement Modeling & The FIRE Roadmap (4% SWR, Trinity study, 3-bucket strategy)
  - Built `LearnGuideDetail.tsx` with highlights, rules of thumb, step-by-step checklists, and "Launch Module" CTAs.
- **Landing Page & Navigation (`LandingPage.tsx` & `App.tsx`):**
  - Upgraded Landing Page with Westro's hero section, persona avatar strip, and 8-module suite explorer.
  - Added "Learn" navigation buttons in top headers, WorkspaceHub footer, and Landing Page.
  - Linked persona avatars into the top navigation bar and user profile dropdowns.
  - Verified frontend build with `npm run build` (0 errors) and backend test suite with `mvn test` (25/25 tests passing).

**Affects other track?** No
- Track A (Reva) can now seamlessly link its upcoming modules (Portfolio Tracker, Net Worth Tracker, Goal Manager, FIRE Planner) into the pre-built Learn Center guides and avatar system.

**Contract impact?** none

**Blocked on:**
- None. Ready for Reva to begin Track A!

**Next session:**
- Reva to start Phase 1 Track A: Prompt A.1 (Portfolio Tracker).

---

### 2026-09-02 — Alok — Track B / Phase 1

**Worked on:** Prompt B.4 EMI Manager Module (Reducing Balance Amortization Engine, Prepayment Optimization Sandbox, Net Worth Liability Contract Sync, and Expense Tracker Cash-Flow Matching)

**Changes made:**
- **Backend Architecture (`com.finora.emi.*`):**
  - JPA Entities: `Loan` (`em_loans` extending `LinkableEntity`), `LoanPrepayment` (`em_loan_prepayments`), and `LoanEmiLog` (`em_loan_emi_logs`).
  - `EmiCalculationEngine`:
    - Independent reducing balance formula $E = P \cdot r \cdot \frac{(1+r)^n}{(1+r)^n - 1}$ isolated from compound growth models.
    - Month-by-month and year-by-year Amortization schedule generator with exact principal, interest, prepayment, and residual balance absorption.
    - Prepayment optimizer simulating **Tenor Reduction** (keeping EMI constant to shorten months) vs **EMI Reduction** (lowering monthly commitment for cash flow).
    - Standalone mathematical calculation engine for instant slider-based simulation.
  - `EmiService`:
    - Loan CRUD and DTO mapping with lifetime interest payable, payoff projections, and progress percentages.
    - Automatic cross-track synchronization with **Net Worth Tracker Liabilities API Contract** (`POST /api/v1/networth/liabilities`) with `sourceModule = EMI_MANAGER` and `isLinked = true`.
    - Internal cash-flow reconciliation scanning `et_transactions` in `ExpenseTracker` to discover and link recurring bank EMI debits.
    - 1-Click Sample Data Seeder (₹50,00,000 HDFC Home Loan @ 8.5% with ₹5L prepayment + ₹8,50,000 ICICI Auto Loan @ 9.2%).
  - `EmiController`: REST endpoints at `/api/v1/emi/*`.
  - Integration Tests: `EmiIntegrationTest` (25/25 backend integration tests passing with `BUILD SUCCESS`).
- **Frontend Architecture (`frontend/src/components/emi/`):**
  - `LoanList.tsx`: 4 KPI summary cards (Total Debt, Monthly Outflow, Interest Payable, Avg Interest Rate), active loan cards with repayment progress meters, and view toggle (Portfolio vs Standalone Calculator).
  - `AddLoanModal.tsx`: Create loan modal with live EMI & interest previews and Net Worth sync checkbox.
  - `LoanDetail.tsx`: 6-action header, hero banner (Lender, Rate, Tenor, Monthly EMI, Outstanding vs Sanctioned progress bar), and 3 navigation tabs:
    - `AmortizationTab`: Calendar-year accordions with month-by-month table and CSV export.
    - `PrepaymentSimulatorTab`: Interactive scenario sandbox (amount, strategy, frequency) with real-time interest savings ticker + recorded prepayments ledger.
    - `ExpenseReconciliationTab`: Internal Expense Tracker scanner matching bank debits.
  - `StandaloneEmiCalculator.tsx`: Interactive sliders for loan amount, interest rate, and tenure with Principal vs Interest breakdown.
  - Router Integration: Linked EMI Manager into `App.tsx` and `WorkspaceHub.tsx` (`Manage Loans` CTA).
  - Verified frontend build with `npm run build` (0 TypeScript / Vite errors).

**Affects other track?** Yes
- If yes — what changed and what the other person needs to do about it:
  - **For Reva (Track A):**
    - EMI Manager actively pushes created loan liabilities to `POST /api/v1/networth/liabilities` with `sourceModule = EMI_MANAGER` and `isLinked = true`.
    - Currently, this runs against the Phase 0.6 `NetWorthContractMockController`.
    - When Reva implements the real **Net Worth Tracker** backend, she can replace the mock controller with the real database-backed liability store, preserving the exact `CreateLiabilityRequest` and `NetWorthLiabilityDto` contracts.
  - **Track B is now 100% Feature-Complete!** All 4 Track B modules (**Expense Tracker**, **Vault**, **Trip Manager**, **EMI Manager**) are built, tested, and verified.

**Contract impact?** Net Worth Liabilities/Assets API
- Verified contract compatibility with `POST /api/v1/networth/liabilities`.

**Blocked on:**
- None. Track B is 100% Done!

**Next session:**
- Track A: Reva can begin Phase 1 with Prompt A.1 (Portfolio Tracker).

---

### 2026-09-02 — Alok — Track B / Phase 1

**Worked on:** Prompt B.3 Trip Manager Module (Itinerary Builder, Family Drag-to-Nest, 4-Tab Expense Modal, Smart Split Solver, Settle Debt Matrix, Pack & Prep Templates, Priority Checklist, and Insights with N/0 Divide-by-Zero Guards)

**Changes made:**
- **Backend Architecture (`com.finora.trip.*`):**
  - JPA Entities: `Trip` (`tr_trips`), `TripParticipant` (`tr_participants` with single-level parent-dependent nesting), `TripPlanStop` (`tr_plan_stops`), `TripCategoryBudget` (`tr_category_budgets` with 7 fixed categories), `TripExpense` (`tr_expenses` in base INR with multi-currency ingress), `TripExpenseSplit` (`tr_expense_splits`), `TripExpensePayment` (`tr_expense_payments`), `TripPackingItem` (`tr_packing_items`), and `TripChecklistItem` (`tr_checklist_items`).
  - `TripService`:
    - Full CRUD lifecycle across trips, stops, category allocations, expenses, settlements, and checklists.
    - 1-Click "Try with Sample Data" seeder (§16.14 fixture: 8-day Vietnam trip, ₹4,50,000 budget, ₹3,26,150 spend across 8 travelers).
    - Smart Split solver computing weighted shares (ratio) and percentage distributions with rounding remainder compensation.
    - Settle matrix calculation netting pairwise traveler balances and computing minimal settlement transfer paths.
    - Insights analytics aggregation with **strict divide-by-zero safeguards** against zero-budget trips ($N/0$).
  - `TripAiPlannerService`: Instant multi-day itinerary generation engine for "Trip Planner Pro".
  - `TripController`: REST endpoints at `/api/v1/trips/*`.
  - Integration Tests: `TripIntegrationTest` (21/21 backend tests across all modules passed with `BUILD SUCCESS`).
- **Frontend Architecture (`frontend/src/components/trip/`):**
  - `CreateTripModal.tsx`: Lightweight manual trip creation modal.
  - `TripPlannerProModal.tsx`: Two-pane AI itinerary generator with quota counter and preview.
  - `TripList.tsx`: Getting Started card (3 setup steps + 3 CTAs), trip cards grid, and 1-click sample data seeder button.
  - `TripDetail.tsx`: 6-action header bar (Back, Edit, AI Regenerate Ideas, Export Report, Delete, Onboarding Guide), hero card, and 5 navigation tabs.
  - `OverviewTab.tsx`: 4 deep-link shortcut tiles (Next on Plan, Budget Status, Open Checklist, Luggage) + participant hierarchy with drag-to-nest single-level dependent grouping.
  - `PlanTab.tsx`: Day-by-day itinerary timeline with category badges, estimated costs, assigned travelers, rich descriptions, and route map waypoints preview.
  - `MoneyTab.tsx`: Persistent spend tracker header (₹ spent / ₹ budget, % used, ₹ left, progress bar) + 4 sub-tabs:
    - `BudgetSubTab`: 7 fixed category budgets, overall cap editor, collapsible Budget vs Plan table, and 3 summary cards.
    - `ExpensesSubTab`: 4-tab Add Expense modal (Basic, Splits, Pay, Notes), multi-currency ingress, and Smart Split Calculator modal.
    - `SettleSubTab`: Participant net balances matrix + 1-click minimal debt settlement recorder.
    - `InsightsSubTab`: Category vs Traveler breakdown, highlights card, and collapsible Full Analysis panel (velocity projection, cost efficiency metrics, payment coverage).
  - `PackAndPrepTab.tsx`: Quick-Add templates (`Basic Essentials`, `Beach Trip`, `Business`, `Cold Weather`), manual item input, and category filters.
  - `ChecklistTab.tsx`: Priority-badged tasks (`High`, `Medium`, `Low`) with due dates, assignees, and done checkboxes.
  - Router Integration: Connected Trip Manager into `App.tsx` and `WorkspaceHub.tsx` (`Manage Itineraries` CTA).
  - Verified frontend build with `npm run build` (0 TypeScript / Vite errors).

**Affects other track?** No
- If yes — what changed and what the other person needs to do about it:
  - Trip Manager is fully self-contained with zero runtime dependencies on Track A modules or Expense Tracker data.

**Contract impact?** none

**Blocked on:**
- None. Track B's Trip Manager is 100% Done!

**Next session:**
- Track B: Proceed to Prompt B.4 (EMI Manager).
- Track A: Reva can proceed with Prompt A.1 (Portfolio Tracker).

---

### 2026-09-02 — Alok — Track B / Phase 1

**Worked on:** Prompt B.2 Vault Module (Zero-Knowledge AES-256-GCM Encryption, Bot-Throttled Unlock Gate, Timed Auto-Hide Reveal, One-Time Recovery Keys, and Vault UI)

**Changes made:**
- **Zero-Knowledge Cryptographic Engine (`frontend/src/utils/vaultCrypto.ts`):**
  - WebCrypto API: `PBKDF2-HMAC-SHA256` (100,000 iterations) key derivation + `AES-GCM-256` encryption with cryptographically random 96-bit IVs.
  - Plaintext Secret Values and the Vault Master Password are **never sent over HTTP or stored in any server-side database**.
- **Backend Architecture (`com.finora.vault.*`):**
  - JPA Entities: `VaultProfile` (`vt_vault_profiles`), `VaultBackupCode` (`vt_backup_codes`), `VaultNote` (`vt_notes`), and `VaultDeviceKey` (`vt_device_keys`).
  - `CaptchaService`: Procedural dynamic visual SVG CAPTCHA generator with background noise, rotating chars, and cryptographic HMAC token verification (Option 1 bot-protection).
  - `VaultService`: Master password verifier validation, 5-attempt brute-force rate-limiting (15-min lockout), 3 one-time emergency backup codes generation/redemption, Biometric & Device Protection toggles (§16.8), and ciphertext-only note CRUD.
  - `VaultController`: REST endpoints at `/api/v1/vault/*`.
  - Integration Tests: `VaultIntegrationTest` (17/17 backend tests passed with `BUILD SUCCESS`).
- **Frontend Architecture (`frontend/src/components/vault/`):**
  - `VaultSetupModal.tsx`: Step 1 Master Password creation with strength checks $\rightarrow$ Step 2 "Vault Secured" screen issuing **exactly 3 one-time recovery codes** (#01, #02, #03) with copy action and offline storage warning banner (§13.2).
  - `VaultUnlockGate.tsx`: Password field + dynamic visual SVG CAPTCHA challenge component + Biometric unlock trigger + emergency backup code recovery modal (§16.9).
  - `VaultNoteModal.tsx`: Create / Edit encrypted notes with 8 category tags (`Finance`, `Official`, `Personal`, `Work`, `Social`, `Banking`, `Medical`, `Custom`).
  - `VaultNoteViewModal.tsx`: Timed auto-hide Secret Value reveal modal featuring a **30-second countdown timer**, visual progress bar, manual hide toggle, and copy action (§16.10).
  - `VaultSettingsModal.tsx`: Dedicated 2-toggle settings for Biometric Unlock & Device Protection (§16.8).
  - `Vault.tsx`: Main module workbench with search scoped to labels/descriptions, tag filters, in-memory key purge on lock, and shared `EmptyState` and `OnboardingDrawer`.
  - Router Integration: Connected Vault into `App.tsx` and `WorkspaceHub.tsx` (`Open Secure Vault` CTA).
  - Verified frontend build with `npm run build` (0 TypeScript / Vite errors).

**Affects other track?** No
- If yes — what changed and what the other person needs to do about it:
  - Vault is 100% self-contained and exposes no cross-track contracts. Reva's Track A work is unaffected.

**Contract impact?** none

**Blocked on:**
- None. Track B's Vault is 100% Done!

**Next session:**
- Track B: Proceed to Prompt B.3 (Trip Manager) or Prompt B.4 (EMI Manager).
- Track A: Reva can proceed with Prompt A.1 (Portfolio Tracker).

---

### 2026-09-02 — Alok — Track B / Phase 1

**Worked on:** Prompt B.1 Expense Tracker (Entities, Service, Controller, Integration Tests, Frontend Tabs, and Real DB-backed Summary API Contract)

**Changes made:**
- **Backend Architecture (`com.finora.expense.*`):**
  - JPA Entities: `IncomeSource` (`et_income_sources`), `ExpenseTransaction` (`et_transactions` extending `LinkableEntity`), `ExpenseTask` (`et_tasks`), and `MonthlyNote` (`et_notes`).
  - Implemented `ExpenseService` with complete calculation engine:
    - Monthly Inflow $\sum \text{Income}$, Total Outflow $\sum \text{Transactions}_{\text{Pending+Done}}$, Cash Flow (Committed), Net Position (Settled), and Pending Outflow.
    - Financial Health Score (0–100), Savings Rate, Expense Ratio, Pending Ratio, 6-Month Emergency Fund Target, and Cash Flow Velocity.
    - "Copy Month" service duplicating recurring income sources, transactions (as Pending), and checklist tasks (as TODO).
  - Exposed full REST API (`/api/v1/expenses/*`) for incomes, transactions, tasks, notes, metrics, insights, and month copying.
  - Replaced Phase 0 Mock with **real database queries** behind `ExpenseContractMockController` (`GET /api/v1/expenses/summary` and `GET /api/v1/expenses/goal-linked`) with graceful seed fallback when no user records exist yet.
  - Integration Tests: `ExpenseTrackerIntegrationTest` (16/16 backend tests passed).
- **Frontend Architecture (`frontend/src/components/expense/`):**
  - `ExpenseTracker.tsx`: Main module container with Month Scoping toolbar (`< 2026-09 >`), Copy-Month action, and 5 sub-tabs.
  - `TransactionsTab.tsx`: Inflow/outflow KPI tiles, status/category filter strip, search bar, table with inline Done/Pending status toggles, Include/Exclude toggle, Goal ID link badges, single-click delink, and Add/Edit modal with multi-currency ingress.
  - `IncomeSourcesTab.tsx`: Monthly income streams ledger with payment instrument tags and modal.
  - `SummaryTab.tsx`: Category Breakdown SVG Donut + Settlement State SVG Donut with percentages, amounts, and color legends.
  - `InsightsTab.tsx`: Financial Health Score gauge (0–100), Savings Rate & Expense Ratio progress bars, 6-Month Emergency Fund cushion, Cash Flow velocity, and actionable advice cards.
  - `TasksAndNotesTab.tsx`: Monthly checklist tasks + append-only timestamped notes log.
  - `CopyMonthModal.tsx`: Modal for bulk duplicating previous budget setups.
  - Verified frontend build with `npm run build` (0 errors).

**Affects other track?** Yes
- If yes — what changed and what the other person needs to do about it:
  - **For Reva (Track A):**
    - The real database-backed **Expense Tracker Summary API** is now live and working!
    - When building **Goal Manager** and **FIRE Planner**, calling `GET /api/v1/expenses/summary` will return real aggregated income, outflow, savings rate, and `trailing12MonthAnnualSpend` from user transactions in base INR.
    - Calling `GET /api/v1/expenses/goal-linked?goalId=...` will return real goal-linked transactions tagged with `linkedGoalId`.
    - The contract schema and endpoint signatures remain 100% identical to the Phase 0 OpenAPI spec (`contracts/cross-track-contracts.yaml`).

**Contract impact?** none (preserved exact OpenAPI contract shape)
- Real database queries now back `/api/v1/expenses/summary` and `/api/v1/expenses/goal-linked`.

**Blocked on:**
- None. Track B's Expense Tracker is 100% Done!

**Next session:**
- Track B: Proceed to Prompt B.2 (Vault) or Prompt B.3 (Trip Manager) or Prompt B.4 (EMI Manager).
- Track A: Reva can proceed with Prompt A.1 (Portfolio Tracker) and consume the real Expense Summary API for Goal Manager and FIRE Planner.

---

### 2026-09-02 — Alok — Track B / Phase 0

**Worked on:** Shared Design System & UI Package Redesign

**Changes made:**
- Replaced generic AI-generated styles with a bespoke, high-authority financial ledger visual identity:
  - **Color Palette:** Obsidian Pine (`#0E1B15`), Alpine Linen (`#F3F6F3`), Surface White (`#FFFFFF`), Parchment Wire (`#D2DDD4` 1px structural borders), Slate Sage (`#425A4E`), Burnished Brass (`#B88728`), Verdant Growth (`#1B6B44`), and Cedar Debt (`#A83A2E`).
  - **Typography:** Imported Google Fonts `Plus Jakarta Sans` (with `font-feature-settings: "tnum"` tabular numbers for all financial digits) and `Fraunces` (serif for executive headline balances).
  - **Eliminated AI Tells:** Removed blurry gray shadows, all-caps tracked eyebrows, middle-dot chains, tacked-on `→` arrows, and bounce animations.
  - **Refactored All Shared Components:** `ToastContext` / `useToast()`, `InsightsCard`, `EmptyState`, `OnboardingDrawer`, `CurrencySelector`, `CurrencyInput`, `LinkedBadge`, `IncludeToggle`, and `<Money />`.
  - **Redesigned Workspace Shell:** Built the Executive Ledger layout in `App.tsx` with dedicated tab navigation for Foundation, Track A Wealth & Growth, Track B Cash Flow & Admin, and Suite Insights.
- Verified frontend build (`npm run build` $\rightarrow$ 0 errors) and backend integration tests (`15/15 passed`).

**Affects other track?** Yes
- If yes — what changed and what the other person needs to do about it:
  - Both Track A (Reva) and Track B (Alok) inherit this upgraded visual design system for all 8 feature modules.
  - Use `font-sans` with `tabular-nums` for tables, `<Money />` for currency figures, 1px `#D2DDD4` borders, and the shared component suite (`Toast`, `InsightsCard`, `EmptyState`, `OnboardingDrawer`, `LinkedBadge`, `IncludeToggle`).

**Contract impact?** shared components
- Shared UI component styling upgraded; props/API surfaces preserved.

**Blocked on:**
- None. Ready for Phase 1 Feature Module development!

**Next session:**
- Phase 1: Track A / Track B feature module development (Portfolio Tracker in Track A / Expense Tracker in Track B).

---

### 2026-09-01 — Alok — Track B / Phase 0

**Worked on:** Phase 0.6 Cross-Track API Contracts (OpenAPI 3.0 Specs & Mock Endpoints)

**Changes made:**
- Authored the formal OpenAPI 3.0 specification file: `contracts/cross-track-contracts.yaml`.
- Implemented **Contract 1: Expense Tracker Summary API** (owned by Track B / Alok, consumed by Goal Manager & FIRE Planner in Track A):
  - DTOs: `ExpenseSummaryDto`, `CategoryBreakdownDto`, `GoalLinkedTransactionDto`.
  - Mock controller: `ExpenseContractMockController` (`GET /api/v1/expenses/summary` and `GET /api/v1/expenses/goal-linked`).
  - Provides monthly totals, savings rate, and `trailing12MonthAnnualSpend` (for FIRE 25x/33x projections).
- Implemented **Contract 2: Net Worth Liabilities/Assets API** (owned by Track A / Reva, consumed by EMI Manager in Track B):
  - DTOs: `NetWorthLiabilityDto`, `CreateLiabilityRequest`.
  - Mock controller: `NetWorthContractMockController` (`GET /api/v1/networth/liabilities` and `POST /api/v1/networth/liabilities`).
  - Supports checking existing liabilities and pushing new loans with `sourceModule = EMI_MANAGER` and `isLinked = true`.
- Added comprehensive integration tests (`FinoraContractsIntegrationTest`) verifying all 4 contract endpoints with MockMvc (15/15 backend tests passed).

**Affects other track?** Yes
- If yes — what changed and what the other person needs to do about it:
  - **For Reva (Track A):**
    - When building **Goal Manager** & **FIRE Planner**, call `/api/v1/expenses/summary` (for annual spend / savings rate) and `/api/v1/expenses/goal-linked` (for goal allocations). The mock server is live and returning realistic fixture data in INR.
    - When building **Net Worth Tracker**, implement the real controller matching `contracts/cross-track-contracts.yaml` to serve liabilities and receive loans pushed by EMI Manager.
  - **For Alok (Track B):**
    - When building **EMI Manager**, push created loan liabilities to `POST /api/v1/networth/liabilities`.
    - When building **Expense Tracker**, replace `ExpenseContractMockController` with real database aggregation.

**Contract impact?** yes (Expense Tracker Summary API & Net Worth Liabilities/Assets API)
- Contract specifications published in `contracts/cross-track-contracts.yaml` and mock endpoints live.

**Blocked on:**
- None. Phase 0 Shared Foundation is now 100% COMPLETE!

**Next session:**
- Phase 1: Track A / Track B feature module development (Track A begins with Portfolio Tracker; Track B begins with Expense Tracker).

---

### 2026-09-01 — Alok — Track B / Phase 0

**Worked on:** Phase 0.5 Shared Frontend Components (Toast, InsightsCard, EmptyState, OnboardingDrawer)

**Changes made:**
- Built the global Toast notification system in `frontend/src/components/shared/ToastContext.tsx`:
  - `ToastProvider` with auto-dismiss timers, animations, action triggers, and `useToast()` hook (`toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()`).
- Built `InsightsCard` in `frontend/src/components/shared/InsightsCard.tsx`:
  - Supports 4 visual types (`positive`, `warning`, `neutral`, `critical`), source module badges, metric callout badges, action buttons, and dismiss handler.
- Built `EmptyState` in `frontend/src/components/shared/EmptyState.tsx`:
  - Standardized empty list/table placeholder with Lucide icon, headline, subtext, primary CTA button with icon, and secondary link.
- Built `OnboardingDrawer` in `frontend/src/components/shared/OnboardingDrawer.tsx`:
  - Slide-over drawer with backdrop blur, numbered step cards with "Pro Tip" badges, and interactive checkable tips checklist with `localStorage` persistence.
- Exported all 4 components from `frontend/src/components/shared/index.ts`.
- Integrated all components into `App.tsx` showcase. Verified `npm run build` (0 errors).

**Affects other track?** Yes
- If yes — what changed and what the other person needs to do about it:
  - Both Track A (Reva) and Track B (Alok) modules MUST use these 4 shared components for standard UI interactions:
    - Wrap action feedback in `useToast().toast.success() / toast.error()`.
    - Render AI nudges / health recommendations using `<InsightsCard />`.
    - Render blank tables / no-data lists using `<EmptyState />`.
    - Render module walkthrough guides using `<OnboardingDrawer />`.

**Contract impact?** shared components
- Shared frontend components package built and exported.

**Blocked on:**
- None

**Next session:**
- Phase 0.6: Cross-Track API Contracts (Expense Tracker Summary API & Net Worth Liabilities/Assets API spec & mocks).

---

### 2026-09-01 — Alok — Track B / Phase 0

**Worked on:** Phase 0.4 Universal Linking Mechanism & Delink Semantics Decision

**Changes made:**
- Built universal linking base classes in `com.finora.common.linking`:
  - `SourceModule` enum (`MANUAL`, `PORTFOLIO`, `NET_WORTH`, `EXPENSE`, `GOAL`, `FIRE`, `TRIP`, `VAULT`, `EMI_MANAGER`).
  - `Linkable` interface & `@MappedSuperclass LinkableEntity` providing `isIncluded` (boolean), `isLinked` (boolean), `sourceModule` (SourceModule), `sourceEntityId` (String), `linkedAt` (LocalDateTime), `delink()`, and `toggleIncluded()`.
  - `LinkableDto` and `LinkingService` (providing safe linking, delinking, and `calculateIncludedSum()` rollup calculations).
- Built shared frontend components in `frontend/src/components/shared/`:
  - `LinkedBadge`: Displays source module pill badge, sync tooltip, and interactive "Delink" button with confirmation.
  - `IncludeToggle`: Switch toggle for `isIncluded` state with label formatting.
- Resolved and documented the **Delink Semantics Decision** in `PROJECT.md §8`: Delink converts a linked record into an independent standalone MANUAL copy with its current frozen values, clearing the link pointer (`isLinked=false`, `sourceModule=MANUAL`, `sourceEntityId=null`) and keeping it fully editable.
- Added comprehensive integration tests (`FinoraLinkingIntegrationTest`) verifying cross-module linking lifecycle, `isIncluded` rollup math, and delink behavior (11/11 tests passed).

**Affects other track?** Yes
- If yes — what changed and what the other person needs to do about it:
  - Any entity in Track A (Portfolio, Net Worth, Goal, FIRE) or Track B (Expense, EMI, Trip, Vault) that can be linked or toggled in rollups MUST extend `LinkableEntity` or implement `Linkable`.
  - Use `LinkingService.delink(entity)` or `entity.delink()` to implement delink actions in all module endpoints.
  - Delink semantics are locked: do NOT delete records on delink; convert them into standalone manual records.
  - On frontend tables, render `IncludeToggle` for the `isIncluded` column and `LinkedBadge` for origin metadata.

**Contract impact?** linking mechanism
- Universal linking interface/superclass and Delink decision established for both tracks.

**Blocked on:**
- None

**Next session:**
- Phase 0.5: Shared Frontend Components (Toast, Insights-card, Empty-state, Onboarding-drawer).

---

### 2026-09-01 — Alok — Track B / Phase 0

**Worked on:** Phase 0.3 Currency Service (Live API, In-Memory Caching & Two-Way Conversion)

**Changes made:**
- Built `ExchangeRateProvider` in `com.finora.common.currency.service` with live fetching from Open Exchange Rates API (`open.er-api.com/v6/latest/INR`) and 1-hour in-memory TTL caching with robust fallback.
- Implemented `CurrencyService` with two-way conversions:
  - Ingress: `convertToBase()` converts foreign amounts (e.g. USD, EUR) to `INR` before saving to DB.
  - Egress/Display: `convertFromBase()` and `format()` convert stored `INR` values on the fly to target display currency.
- Created `CurrencyCode` enum with rich metadata (name, country, symbol, flag emoji, decimal places) for 9 currencies (`INR`, `USD`, `EUR`, `GBP`, `JPY`, `AED`, `SGD`, `CAD`, `AUD`).
- Created public REST endpoints: `GET /api/v1/currencies/supported`, `GET /api/v1/currencies/rates`, `POST /api/v1/currencies/convert`, `POST /api/v1/currencies/to-base`.
- Created frontend `CurrencyContext` with automatic live rate synchronization and `useCurrency()` hook.
- Created shared UI components: `<Money />` (renders converted amount with base INR tooltip), `<CurrencySelector />` (shows flag, currency name, and country), `<CurrencyInput />` (allows inputting in foreign currency with live INR conversion preview).
- Added comprehensive integration tests (`FinoraCurrencyIntegrationTest`) verifying live API fetching, cached conversions, and REST endpoints (9/9 tests passed).

**Affects other track?** Yes
- If yes — what changed and what the other person needs to do about it:
  - **Storage Convention:** All amounts in database entities across both Track A and Track B MUST be stored in user's base currency `INR`.
  - If a user enters an amount in a foreign currency in any form/modal, use `convertToBase(amount, foreignCode)` before saving.
  - Use `<Money amount={val} />` or `formatDisplay(val)` on frontend to render monetary values in the user's active display currency.

**Contract impact?** none
- Shared foundation currency endpoints created; no cross-track feature contracts altered.

**Blocked on:**
- None

**Next session:**
- Phase 0.4: Universal Linking Mechanism (`isIncluded`/`isLinked`/`sourceModule` shared backend concern + Delink semantics decision).

---

### 2026-09-01 — Alok — Track B / Phase 0

**Worked on:** Phase 0.2 Auth/JWT & Shared Profile/Workspace Table

**Changes made:**
- Built JWT issuance & validation in `com.finora.common.auth`. Endpoints: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`.
- Implemented stateless `JwtAuthenticationFilter` and `SecurityConfig` (Spring Security 6).
- Created shared `UserProfile` entity (`user_profiles` table) and repository in `com.finora.common.user` with fields: `id` (VARCHAR(64)), `email`, `password_hash`, `full_name`, `base_currency`, `avatar_url`, `created_at`, `updated_at`.
- Created SQL schema migration script `backend/src/main/resources/schema.sql` supporting PostgreSQL (Supabase) and H2.
- Created `.env` and `.env.example` at root, backend, and frontend for Supabase credentials and JWT secrets.
- Implemented frontend `AuthContext` and Axios `apiClient` with automatic Bearer token injection.
- Added comprehensive integration tests (`FinoraAuthIntegrationTest`) verifying login, registration, token issuance, and protected endpoint access.

**Affects other track?** Yes
- If yes — what changed and what the other person needs to do about it:
  - Shared table `user_profiles` is live. Downstream tables in all 8 modules (both Track A and Track B) should reference `user_id VARCHAR(64)` matching `user_profiles.id`.
  - Feature modules do not handle authentication; use `@AuthenticationPrincipal UserPrincipal user` or `SecurityUtils.getCurrentUserId()` to access the authenticated user.
  - Seeded demo users available for development: `demo@finora.local`, `alok@finora.local`, `reva@finora.local` (all passwords: `password123`).

**Contract impact?** none
- Shared foundation auth endpoints created; no cross-track feature contracts altered.

**Blocked on:**
- None

**Next session:**
- Phase 0.3: Currency Service (baseCurrency per user + display conversion utility).

---

### 2026-09-01 — Alok — Track B / Phase 0

**Worked on:** Phase 0.1 Repo Scaffolding & Package Convention

**Changes made:**
- Decided and established unified monorepo structure (`backend/` and `frontend/`).
- Scaffolded backend with Spring Boot 3.3.4 (Java 21, Maven), Spring Web, JPA, Security, Validation, PostgreSQL/H2, Lombok, JJWT, and SpringDoc OpenAPI.
- Scaffolded frontend with React 18, TypeScript, Vite, Tailwind CSS, PostCSS, Lucide-React, and React Router.
- Set up package convention `com.finora.<module>.*` in backend with `package-info.java` for all 8 modules (`portfolio`, `networth`, `goal`, `fire`, `expense`, `trip`, `vault`, `emi`) + `common` + `insights`.
- Set up matching directory structure in `frontend/src/modules/` for all 8 modules + `insights` + shared components.
- Verified backend compilation (`mvn clean compile` -> BUILD SUCCESS) and frontend build (`npm run build` -> 0 errors).

**Affects other track?** Yes
- If yes — what changed and what the other person needs to do about it:
  - Repository structure, package hierarchy (`com.finora.<module>.*`), and frontend module paths (`src/modules/<module>`) are established. Both tracks must adhere to this folder/package layout for their respective modules.

**Contract impact?** none
- Skeleton only; no API contracts or payloads modified yet.

**Blocked on:**
- None

**Next session:**
- Phase 0.2: Auth/JWT issuance & validation + Shared Profile/Workspace table and schema migration.

---

## Quick-Reference: What Counts as "Affects the Other Track"

Use this to decide fast whether an entry needs a "Yes" — anything touching these is cross-track by definition:

- Anything in the shared foundation: Auth/JWT, Profile/Workspace table, currency service, `isIncluded`/`isLinked`/`sourceModule` mechanism, shared frontend components
- Either API contract's shape (Expense Tracker Summary API, Net Worth Liabilities/Assets API) — request/response fields, endpoint paths, auth requirements
- The Delink semantics decision (both tracks inherit it)
- The shared growth engine (compound growth + FV-of-annuity), once built in Net Worth Tracker
- Package/namespace convention changes
- Anything that changes a mock's expected shape — if you change your side of a contract, the other person's mock is now wrong until they update it

If none of these are touched, it's safe to mark "No" and the other person can skim past the entry.

---

## Open Cross-Track Items (carried forward until resolved)

| Raised by | Item | Status |
|---|---|---|
| — | — | — |
