# Westro — Master Feature & Content Doc
Extracted from a full site mirror of westro.in (public marketing/SEO pages + Learn content hub).
Use this to diff against your existing codebase and identify missing modules/features.

---

## Implementation Instructions (read this first, AI coding assistant)

This is an **add-on spec for an existing codebase**, not a from-scratch build. The project already
implements versions of these 8 modules. Your job is to **extend, not replace**.

1. **Preserve everything that already exists and works.** Do not rewrite, rename, or restructure
   existing modules, files, components, API routes, or DB schema unless a specific item below
   requires a genuine extension of them (e.g. adding a new field, endpoint, or linking mechanism).
   When in doubt, add alongside rather than modify in place.
2. **Go module by module** (§2.1 → §2.8 below). For each module:
   - First inspect the current implementation to see what's already covered.
   - Identify only the items in this doc that are **genuinely missing** — don't re-implement
     something that already exists under a different name or slightly different UX; treat
     existing-but-different as intentional unless it's clearly an omission (e.g. a missing
     business rule like "one investment → one goal" causing double-counting bugs).
   - Implement the missing pieces, matching the existing codebase's conventions: package/module
     naming, component structure, state management, API shape, and styling approach already in
     use in this repo — not whatever is implied by the doc's wording.
3. **Match the existing stack and patterns already in this repo** (Spring Boot + React + TypeScript
   + Tailwind + PostgreSQL/Supabase + JWT auth, if that's what's present) — do not introduce a new
   framework, state library, or styling approach to implement a missing feature.
4. **Business rules are the highest-priority items** — things like Goal Manager's "one investment
   can only link to one goal," Expense Tracker's Done-triggers-contribution mechanism, Net Worth's
   per-class delink (vs. all-or-nothing), and Loan Manager's floating-rate-not-retroactive rule.
   These are easy to miss and easy to get subtly wrong — implement them exactly as described, and
   flag it explicitly if the existing code already does something that conflicts with one of these
   rules so it can be reviewed rather than silently overridden.
5. **§3 (Learn hub) and §4 (Privacy Policy) are optional/lower priority** — only implement if asked;
   they're informational, not core product gaps.
6. **§5 (Technical Notes) is background only** — not implementation instructions.
7. **When something in this doc is ambiguous or underspecified** (exact formulas, exact field
   validation, exact UI layout), make a reasonable implementation choice consistent with the rest
   of the app rather than guessing wildly, and leave a short comment or note flagging the
   assumption — since this doc was reconstructed from public marketing copy, not the original
   source code, some details are necessarily inferred rather than exact.
8. **After implementing, produce a short summary** of what was added vs. what was already present
   vs. what was intentionally left as-is because the existing approach differs on purpose.

> **Scope note:** This mirror captured the public, pre-auth pages — landing page, each tool's
> marketing/how-to page, the Learn content hub, and legal pages. The actual authenticated
> in-app screens (real forms, tables, calculators) sit behind `profiles.html` (sign-in) and
> were **not** captured — they render client-side after login. What follows is the full
> feature/workflow spec as Westro itself describes it, which is enough to build the actual
> UI/logic from, but not literal DOM markup of the live tool screens.

---

## 1. Site Structure

**Product suite (8 tools) + supporting pages:**
- `/` — Home / landing (suite overview)
- `/portfolio-tracker`
- `/goal-manager`
- `/net-worth`
- `/loan-manager`
- `/fire-planner`
- `/trip-manager`
- `/vault`
- `/monthly-expense`
- `/profiles` — Sign in (Google or email)
- `/account?p=help-support` — Account/help (behind sign-in)
- `/learn` — Content hub (7 categories, see §3)
- `/privacy-policy`

**Global positioning (from Home):**
Title: *"Westro | Personal finance dashboard – Portfolio Tracker, Net Worth, Analytics & Secure Vault"*
Tagline: *"Take control of your wealth"*
Meta description: privacy-first personal finance dashboard — net worth, real-time portfolio tracking, analytics, encrypted vault.

---

## 2. Module-by-Module Feature Spec

### 2.1 Portfolio Tracker
*Indian & US stocks, ETFs, mutual funds, NPS, deposits, bonds, metals, real estate — tracked in one dashboard (INR or USD), with allocation and gain/loss.*

**Workflow:**
1. Pick an asset-class tab to start (Indian stocks, US stocks, US ETFs, mutual funds, or deposits) — add more classes once comfortable.
2. Entry fields differ by class: Indian stocks/funds → units + average buy price. US stocks/ETFs → quantity + cost in USD. Deposits/bonds/metals/property → invested value + current value.
3. List management: search, sort, edit, dedupe.
4. **Summary** view: invested amount, current value, total gain, allocation across all assets.
5. Allocation review — flag over-concentration in one asset class.
6. Manual/periodic price refresh for stocks & funds.
7. Monthly review cadence built into the workflow (growth, laggards).

**Tips → implies features:** top gainers / top laggards view; "category mix" field for multi-bucket "Other" instruments; per-row naming for clarity.

**Cross-links:** feeds Net Worth Tracker (read-only linked sections) and Goal Manager (holdings can be linked to a goal, 1 holding → 1 goal max) and FIRE Planner (can pull starting corpus).

---

### 2.2 Goal Manager
*Savings goals with contribution plans, pace alerts, what-if projections, multi-goal conflict warnings, Expense Tracker links.*

**Workflow:**
1. **Create a goal**: name, category, target date, amount. For far-out goals, enter target in today's money — app estimates future value needed. Optional starting balance for cash outside Portfolio Tracker.
2. **Link investments (optional)**: open "Link Investments" tab on a goal, pick Portfolio Tracker holdings — live values flow into saved amount automatically. One holding → one goal only (enforced).
3. **Link with Expense Tracker (optional)**: in Expense Tracker, a Savings/Investment/Retirement/FIRE line can be allocated to a goal; marking it "Done" logs a contribution. Savings lines always add to balance; Investment/Retirement/FIRE lines can tag a goal without double-counting if it already has portfolio links.
4. **Log contributions**: tap "+" on a goal card, use "Bulk" on the Goals tab (splitting one deposit across goals), or add entries directly in a goal's History.
5. **Insights**: combined progress across goals, which need attention, whether monthly plan fits savings capacity (set in Settings).
6. **Goal detail view**: overview, contribution history, actual-vs-planned chart, milestones. Linked Portfolio holdings show on both the goal overview and the Portfolio Tracker holding row.

**Key business rules:**
- Settings has a "monthly savings capacity" figure used by Insights to flag over-committed goals.
- Today's-money entry + inflation-adjusted target calculation as the default long-horizon mode (vs. "future value" mode if already inflation-adjusted by the user).
- One investment → one goal (hard constraint, mentioned twice).

---

### 2.3 Net Worth Tracker
*Assets minus liabilities, with Portfolio auto-linking, category breakdown, health score, projections.*

**Workflow:**
1. **Link Portfolio automatically**: if Portfolio Tracker is used, its classes (Mutual Funds, Stocks, NPS, etc.) appear as **read-only** linked sections in Net Worth. Any class can be individually "delinked."
2. **List other assets**: cash, vehicles, personal property, anything Portfolio doesn't cover — these stay manually editable.
3. **Add liabilities**: loans, mortgages, credit cards. Net worth = assets − liabilities.
4. **Analyze breakdown**: dashboard shows category mix, a "health score," and projections. Portfolio-linked amounts update live.

**Key business rules:** Portfolio-linked sections are read-only inside Net Worth (edit must happen in Portfolio Tracker); delinking is reversible; manual assets export separately from Portfolio-synced ones (separate backup/export paths implied).

---

### 2.4 Loan / EMI Manager
*Home/car/personal/education loans — schedule, prepay-vs-invest comparison, Net Worth linking.*

**Workflow:**
1. **Add each loan**: name, amount borrowed, yearly interest rate, start date. Supports marking a loan as "already running" (mid-way catch-up entry).
2. **Attach an EMI plan (optional)**: "EMIs" tab → Standard EMI or Fixed Principal plan. Loans without a plan still track principal + manual payments.
3. **Record payments**: "Payments" tab for extra prepayments. Past EMI dues auto-marked paid; manual override options: Partial, Skip, Note (for reality vs. plan mismatches).
4. **Prepay vs. invest comparison**: on a loan row, "Prepay or invest" view — interest avoided by prepaying vs. growth if the same cash were invested at an assumed return.
5. **Link into Net Worth**: "landmark" icon on a loan adds its outstanding balance as a Net Worth liability; delinkable from either side.
6. **Keep current**: update floating rates / balances as they change (rate changes don't apply retroactively — only from the date you update them).

**Amortization types:** Reducing-principal (standard bank EMI) and Flat-rate (only when lender explicitly quotes flat).

**Disclaimer content** (legally relevant if you replicate it): estimates only, not advice; no bank/bureau integration — everything is user-entered; floating rate changes are not automatic.

---

### 2.5 FIRE Planner
*Financial Independence / Retire Early calculator — 4% rule based, with two calculation modes.*

**Workflow:**
1. **Enter finances**: choose Net Worth or Portfolio Tracker as the source of starting corpus; optionally pull spending from Expense Tracker.
2. **Calculate corpus**: FIRE number computed via the 4% rule + inflation assumption.
3. **Mode toggle**: "Years to FIRE" (timeline given current savings) vs. "Required Savings" (monthly investment needed to retire by a target age).
4. **Visualize**: "Summary" tab — savings growth projection chart + actionable insights.

**Tips → implies fields:** expected return input (typical 8–12% suggested), inflation input (6–7% suggested for India), withdrawal rate input (adjustable, tied to 4% rule default).

---

### 2.6 Trip Manager
*Travel expense tracker + group cost splitter, with AI-assisted itinerary planning.*

**Workflow:**
1. **Create a trip**: "Trip Planner Pro" (AI-assisted) or manual trip; each trip gets its own page.
2. **Add travelers**: on the Overview tab, so costs can be split.
3. **Plan and spend**: build itinerary in "Plan" tab; log costs & settle balances in "Money" tab.
4. **Prep and notes**: "Pack & Prep" tab for packing lists/checklists; freeform notes.

**Tips → implies features:** custom (non-equal) split option for shared expenses; a "Balances" view to settle up before trip end; PDF export of the full trip report.

*(Cross-reference: your Finora notes already document this module in more depth — AI itinerary planner, Money tab, Pack & Prep, Smart Split Calculator — consistent with what's here.)*

---

### 2.7 Vault (Secure Notes)
*Encrypted private notes locker — zero-knowledge design (Westro states it cannot open notes or reset a forgotten password).*

**Workflow:**
1. **Set vault password** — separate from account password; explicitly told not to reuse an email/banking password.
2. **Save backup codes** at setup — the only recovery path if password is forgotten (no server-side reset possible).
3. **Add private notes.**
4. **Optional: Device Protection** — an extra lock for unrecognized browsers, toggled in Vault Settings; generates a one-time-shown key that must be saved.
5. **Optional: Face ID / fingerprint** — convenience unlock shortcut; password still required as fallback.
6. **End session** — explicit "lock the vault" action recommended when stepping away.

**Key design constraints to replicate:**
- Zero-knowledge: server never has the means to decrypt/reset (backup codes are the sole recovery mechanism).
- Device Protection key is shown once only.
- Copy-to-clipboard guidance implies a "clear clipboard after paste" UX nudge (mentioned in disclaimer).

---

### 2.8 Monthly Expense Tracker
*Income/expense tracking with categorization, Pending/Done states, and Goal Manager linking.*

**Workflow:**
1. **Add income sources** — supports recurring inflows (auto-tracking).
2. **Log expenses** — categorized; line items have a **Pending / Done** status; "Done" = paid, used for real net-position calculation.
3. **Link savings to goals** — Savings/Investment/Retirement/FIRE-tagged lines can optionally allocate to a Goal Manager goal; marking "Done" posts a contribution automatically.
4. **Analyze spending** — "Summary" tab: spending vs. savings visual breakdown.
5. **Plan ahead** — "Copy From" feature to bring recurring items forward from a previous month; supports tasks/notes.

**Key business rule:** this is the module that *writes into* Goal Manager (via the Done-triggers-contribution mechanism) — matches what's already in your Finora notes almost exactly.

**Also implied:** per-profile setup ("set up specific profiles for family members") — ties into the multi-profile / household-ledger concept covered in Learn.

---

## 3. Learn Content Hub (`/learn`)
Positioning: *"A question, then your numbers, then a plan you can track."* Each category pairs an educational article with a link into the matching tool.

| Category | Hook / Angle | Sample article |
|---|---|---|
| Profiles | Keep each life's money in its own ledger — separate profiles, switch active ledger, read-only sharing | *Why keep household finances in separate profiles* |
| Digital safety | Lock private notes with a key only you hold — what a vault can/can't do, backup codes | *What to store in an encrypted vault* |
| Expenses & budgeting | Separate inflow/spending/set-aside so "savings rate" means something repeatable | *How to calculate savings rate* |
| Net worth | Assets-minus-liabilities snapshot, kept honest over time | *How to calculate net worth* |
| Goals | Turn a target + date into a trackable savings path; return/inflation what-ifs before committing | *How much to invest monthly for a ₹50 lakh goal* |
| Retirement & FIRE | How much you need so work becomes optional; inflation's effect; path-watching in Westro | *How much money to retire at 45* |
| Portfolio management | India-first guides for unifying stocks/funds/global holdings/other assets | *Calculate portfolio allocation*, *Equity/debt/gold allocation*, *Indian & US portfolio tracking*, *Track mutual funds and stocks together* |
| Travel money | Fair group-expense splitting without spreadsheets | *How to split group trip expenses* |

**Notable cross-tool linking pattern:** every Learn article ends with a CTA into the relevant tool, often pre-filled via query params (confirmed in the mirror — e.g. `goal-manager?from=learn&name=₹50 lakh goal&category=Home Purchase&target=5000000&date=2036-09-21&basis=future_nominal&inflation=5&start=0&return=9&freq=monthly`, `fire-planner?from=learn&age=30&savings=0&expenses=600000&return=9&withdraw=4&inflation=5&years=15&mode=savings&monthly=82409`). This is a **feature worth replicating**: "Learn" pages can deep-link into a tool with a pre-computed example already populated via URL query params, matching each field name in that tool's actual form schema.

---

## 4. Privacy Policy — Key Commitments (if replicating legal copy)
Sections present: Your Consent, What We Collect (Account Details, Financial Info, optional Google Drive Backup), Where Your Data Lives (on-device vs. on-server split, Vault called out separately as zero-knowledge), Our Security Promise, Cookies, Third-Party Services (Google Services + others), Data Sharing, Your Rights & Control, Legal Compliance (India + GDPR/CCPA sections), Children's Privacy, Data Retention, **Beta Phase Notice**, Changes to Policy, Migration Notice, Contact Us.

Worth noting: a **"Beta Phase Notice"** and a **"Migration Notice"** exist as distinct sections — suggests the live product frames itself as in beta and has undergone (or plans) a data migration, both worth deciding whether to carry into your rebuild's own policy.

---

## 5. Technical Notes from the Scrape
- **Framework:** Next.js (App Router) — route groups visible in the JS chunk paths: `(tools)/fire-planner`, `(tools)/goal-manager`, etc., plus dynamic routes `learn/[topicSlug]/[articleSlug]`.
- **Styling:** Tailwind CSS, fully unminified class names in 6 captured stylesheets (one 294KB, one 55KB — these are your real design tokens/utility usage, reusable as reference).
- **JS:** 82 production chunks, minified (names stripped) but not obfuscated — logic is traceable, not directly reusable as source. Confirms icon set = Lucide.
- **Auth:** Google or email sign-in (`profiles.html` title: *"Sign in | Westro"*); the actual tool UIs (forms, tables) render client-side post-auth and were not part of this mirror.
- **Assets captured:** favicons, apple-touch-icon, site.webmanifest, a handful of responsive webp/png images (multiple width variants — Next/Image optimization artifacts, not separate original images).

---

## 6. Suggested Use
Diff each module's workflow/rules above against your existing codebase module-by-module (Portfolio Tracker → Loan Manager → FIRE Planner, etc.) and flag gaps — e.g., likely candidates based on what's documented here versus what's typically first-cut in a rebuild:
- Goal Manager's Bulk-contribute + Insights pace-warning logic
- Net Worth's per-class **delink** toggle (vs. all-or-nothing Portfolio sync)
- Loan Manager's Prepay-vs-Invest comparison view
- Vault's Device Protection (browser-trust key) layer
- Learn → tool deep-linking with pre-filled query params
