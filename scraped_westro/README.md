# Scraped Westro (westro.in) Complete Replica Package

This directory contains the full scraped source, assets, routes, and architectural blueprints extracted directly from `https://westro.in/`.

---

## 1. Directory Structure

```
scraped_westro/
├── assets/                       # Downloaded brand images, logos, wordmarks & avatars
│   ├── westro-wordmark.png       # Light mode wordmark
│   ├── westro-wordmark-dark.png  # Dark mode wordmark
│   ├── logo-20260528.png         # Brand favicon & app icon
│   ├── boy.png, girl.png, user.png
│   └── profile-*.webp            # 6 persona avatar illustrations
├── chunks/                       # 31 compiled Next.js webpack & React chunks + CSS stylesheets
│   ├── 45d5b1a5b061f68e.css      # Core Tailwind CSS rules
│   ├── 7c4fc208f240e95e.css      # App design system styles & themes
│   ├── layout-a6147cdf1b70fea3.js# Master root layout & navigation
│   └── page-*.js                 # Route implementations
├── learn/                        # Complete scraped educational and module docs
│   ├── _learn.html
│   ├── _learn_digital-safety.html
│   ├── _learn_expenses-and-budgeting.html
│   ├── _learn_goals.html
│   ├── _learn_net-worth.html
│   ├── _learn_portfolio-management.html
│   ├── _learn_profiles.html
│   ├── _learn_retirement-and-fire.html
│   └── _learn_travel-money.html
├── analysis_summary.json         # Route, endpoint, and asset map
├── index.html                    # Root landing page HTML
├── _portfolio-tracker.html       # Portfolio tracker entry
├── _net-worth.html               # Net worth entry
├── _vault.html                   # Vault entry
└── _privacy-policy.html          # Privacy policy
```

---

## 2. Complete Module & Route Map

| Westro Route | Finora Equivalent | Status & Features |
|---|---|---|
| `/` | Landing Page | Hero banner, Feature matrix, Suite breakdown, Footer |
| `/profiles` | Multi-Profile System | Profile creation, Avatars, Base currency, Family nesting |
| `/portfolio-tracker` | Portfolio Tracker (Track A) | Multi-asset stocks, mutual funds, gold, crypto, USD conversion |
| `/net-worth` | Net Worth Tracker (Track A) | Assets, Liabilities, Balance sheet, Compound growth engine |
| `/goal-manager` | Goal Manager (Track A) | Target amounts, Target dates, SIP requirements, Linkages |
| `/fire-planner` | FIRE Planner (Track A) | Financial independence calculator, SWR, Coast FIRE, Lean FIRE |
| `/monthly-expense` | Expense Tracker (Track B) | Monthly budget scoping, Categories, Inflow vs Outflow, Status |
| `/trip-manager` | Trip Manager (Track B) | Day-by-day itinerary, Smart Split, Debt Settle matrix, Pack lists |
| `/vault` | Vault (Track B) | Zero-knowledge client encryption, Backup codes, 30s timed reveal |
| `/emi-manager` | EMI Manager (Track B) | Reducing balance amortization, Prepayment simulator, Net Worth sync |
| `/learn/*` | Learn Center | 8 domain guides (digital safety, budgeting, net worth, FIRE, etc.) |

---

## 3. Discovered API Endpoints & Protocols

- **Market & Session**: `/api/data/v2/market-session-key`, `/api/portfolio-tracker/usd-exchange-rate`
- **Data Packing & Encryption**: `/api/data/pack`, `/api/data/unpack`, `/api/data/v2/pack-token`
- **Analytics & History**: `/api/portfolio-tracker/snapshot-history`, `/api/analytics/ingest`
- **User & Sync**: `/api/eqv/users/sync`, `/api/user/quota`, `/api/users/update-login-metadata`

---

## 4. Visual Identity & Brand Styling Extracted

- **Color Palettes**:
  - Primary Brand Burgundy/Claret: `#950C39` / Dark accent: `#D39B85`
  - Canvas Background: Light `#EDE9E4` / `#FAFAF9` | Dark `#000000` / `#09090B`
  - Card Surfaces: `bg-app-surface-card` with `1px border-app-border` (`#E7E5E4`)
- **Typography**:
  - Primary Font: Plus Jakarta Sans / Inter
  - Brand Heading: Fraunces / Serif accent for numbers and currency values
- **Interaction Elements**:
  - Rounded pill tags, circular icon badges, high-contrast modal cards, timed reveals, and wave animations.
