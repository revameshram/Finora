export interface LearnGuide {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: 'Cash Flow' | 'Security' | 'Growth' | 'Foundations';
  readTimeMinutes: number;
  icon: string;
  moduleTarget?: string;
  summary: string;
  highlights: string[];
  keyPrinciples: {
    heading: string;
    explanation: string;
    ruleOfThumb?: string;
  }[];
  practicalSteps: string[];
  proTips: string[];
}

export const LEARN_GUIDES: LearnGuide[] = [
  {
    id: 'guide_digital_safety',
    slug: 'digital-safety',
    title: 'Digital Safety & Vault Cryptography',
    tagline: 'Zero-knowledge principles, client-side AES-256-GCM encryption, and disaster recovery.',
    category: 'Security',
    readTimeMinutes: 6,
    icon: 'ShieldCheck',
    moduleTarget: 'vault',
    summary: 'How to protect sensitive banking PINs, crypto seed phrases, and official documents using client-side WebCrypto PBKDF2-SHA256 and AES-GCM-256 encryption.',
    highlights: [
      'Zero-knowledge architecture: Plaintext passwords never touch servers',
      'One-time emergency backup recovery codes for disaster lockout recovery',
      'Timed 30-second secret reveal to defeat shoulder-surfing and screen sniffers',
      'Client-side key derivation with 100,000 PBKDF2 rounds',
    ],
    keyPrinciples: [
      {
        heading: '1. Zero-Knowledge Key Derivation',
        explanation: 'Your Master Vault Password is never transmitted over the network or saved in any database. Instead, your browser derives a 256-bit AES-GCM symmetric key using PBKDF2-SHA256 with 100,000 iterations.',
        ruleOfThumb: 'Use a memorable passphrase of 4+ random words rather than complex symbols you might forget.',
      },
      {
        heading: '2. Ephemeral In-Memory Decryption',
        explanation: 'Sensitive notes are decrypted strictly on demand in volatile RAM and automatically cleared when you lock the vault or after 30 seconds of inactivity.',
        ruleOfThumb: 'Never screenshot decrypted values; use the 1-click copy feature which purges the clipboard after use.',
      },
      {
        heading: '3. The Emergency Recovery Triad',
        explanation: 'Exactly three cryptographically unique backup codes are generated during initial vault creation. Each code can be redeemed once to re-key the vault if you forget your master password.',
        ruleOfThumb: 'Store physical printouts of your backup codes in distinct geographic locations (e.g. home safe and bank locker).',
      },
    ],
    practicalSteps: [
      'Initialize your Vault and write down your 3 emergency backup codes on paper.',
      'Group sensitive credentials by category: Banking, Identity, Crypto, or Official.',
      'Enable Device Protection & Biometric Unlock for seamless yet secure daily access.',
      'Review and rotate stored credentials annually.',
    ],
    proTips: [
      'Keep backup codes offline — never email them or save them in cloud storage.',
      'Use Vault category tags to rapidly filter notes during urgent travel or banking situations.',
    ],
  },
  {
    id: 'guide_expenses',
    slug: 'expenses-and-budgeting',
    title: 'Cash Flow Mastery & Budget Scoping',
    tagline: 'The 50/30/20 rule, monthly budget scoping, and eliminating pending drag.',
    category: 'Cash Flow',
    readTimeMinutes: 7,
    icon: 'Receipt',
    moduleTarget: 'expense-tracker',
    summary: 'Master personal cash flow by isolating monthly budget envelopes, auditing recurring outflows, and maintaining an emergency runway.',
    highlights: [
      'Budget Month scoping (YYYY-MM) for deterministic cash tracking',
      'Real-time savings rate and expense ratio metrics',
      'Pending vs Done transaction states to track unbilled credit cards and uncleared cheques',
      '6-Month Emergency Fund cushion benchmark',
    ],
    keyPrinciples: [
      {
        heading: '1. The 50/30/20 Capital Allocation Framework',
        explanation: 'Allocate 50% of net income to Needs (rent, groceries, utilities, EMIs), 30% to Wants (dining, hobbies, leisure), and a non-negotiable 20% to Savings & Investments.',
        ruleOfThumb: 'Target a minimum 35% savings rate if your goal is early financial independence.',
      },
      {
        heading: '2. The Pending Drag Diagnostic',
        explanation: 'Transactions logged as Pending (e.g., credit card swipes before monthly statement settlement) represent committed future liabilities that drain liquid checking balances.',
        ruleOfThumb: 'Always reconcile Pending debits weekly to prevent end-of-month cash crunches.',
      },
      {
        heading: '3. The 6-Month Emergency Runway',
        explanation: 'Maintain 6 months of essential living expenses in high-yield liquid instruments (savings bank, sweep-in FDs, or liquid mutual funds) before taking aggressive equity exposure.',
        ruleOfThumb: 'Emergency Fund = (Monthly Needs + Fixed EMIs) × 6.',
      },
    ],
    practicalSteps: [
      'Scope your current Budget Month in Expense Tracker and log all fixed income sources.',
      'Record recurring debits and categorise them into Fixed Needs vs Discretionary Wants.',
      'Use the "Copy Month" utility at month-end to replicate recurring budgets seamlessly.',
      'Review your Health Score (0–100) and Cash Velocity weekly.',
    ],
    proTips: [
      'Tag high-priority investments with `linkedGoalId` to track progress against life milestones.',
      'Toggle `Include in Totals` on non-standard reimbursable expenses to preserve baseline metrics.',
    ],
  },
  {
    id: 'guide_emi',
    slug: 'emi-and-amortization',
    title: 'Loan Schedules & Prepayment Acceleration',
    tagline: 'Reducing balance mechanics, tenure vs EMI reduction, and interest optimization.',
    category: 'Cash Flow',
    readTimeMinutes: 8,
    icon: 'CreditCard',
    moduleTarget: 'emi-manager',
    summary: 'Understand the mathematical mechanics of reducing balance amortization and leverage strategic prepayments to eliminate years of interest payments.',
    highlights: [
      'Exact reducing balance formula calculation: E = P · r · (1+r)^n / ((1+r)^n - 1)',
      'Tenor Reduction vs EMI Reduction optimization tradeoffs',
      'Annual bonus and extra monthly SIP prepayment strategies',
      'Automated Net Worth liability balance synchronization',
    ],
    keyPrinciples: [
      {
        heading: '1. Reducing Balance Math',
        explanation: 'In early loan years, the bulk of every EMI goes towards interest, with only a fraction reducing principal. As principal reduces, interest drops and principal repayment accelerates.',
        ruleOfThumb: 'Prepayments made in the first 5 years of a 20-year loan save up to 3x more interest than prepayments made later.',
      },
      {
        heading: '2. Tenor Reduction vs EMI Reduction',
        explanation: 'Choosing "Reduce Tenor" keeps your monthly EMI unchanged while shortening total duration, yielding maximum interest savings. "Reduce EMI" lowers monthly burn for cash-flow relief.',
        ruleOfThumb: 'Always choose Reduce Tenor unless you are facing a severe short-term liquidity constraint.',
      },
      {
        heading: '3. The "1 Extra EMI per Year" Rule',
        explanation: 'Paying just one extra monthly EMI each calendar year on a 20-year home loan can cut your loan tenure by nearly 4.5 years and save up to 25% in lifetime interest.',
        ruleOfThumb: 'Automate a yearly prepayment equal to 1 month EMI using your annual performance bonus.',
      },
    ],
    practicalSteps: [
      'Register your active Home, Car, and Personal loans in EMI Manager.',
      'Enable Net Worth Sync to reflect declining debt in your consolidated balance sheet.',
      'Use the Prepayment Sandbox to test lump sums and extra monthly contributions.',
      'Reconcile bank statements against the monthly amortization ledger.',
    ],
    proTips: [
      'Export the yearly amortization schedule to CSV at tax time for section 24(b) and 80C interest/principal deductions.',
    ],
  },
  {
    id: 'guide_travel',
    slug: 'travel-money',
    title: 'Group Travel Splits & Multi-Currency Economics',
    tagline: 'Real-time multi-currency ingress, smart split algorithms, and debt minimization.',
    category: 'Cash Flow',
    readTimeMinutes: 6,
    icon: 'Compass',
    moduleTarget: 'trip-manager',
    summary: 'How to plan group travel budgets, record multi-currency expenses without FX confusion, and settle debts with minimum transactions.',
    highlights: [
      'Multi-currency ingress: Log in USD, EUR, VND, JPY with automated base INR conversion',
      'Smart Split solver supporting Equal, Exact, Shares, and Percentage distributions',
      'Debt Minimization Matrix to settle group balances in the fewest possible UPI transfers',
      'Family and dependent nesting for single-payer accountability',
    ],
    keyPrinciples: [
      {
        heading: '1. The Base Currency Anchor',
        explanation: 'All travel transactions are recorded with their foreign currency amount but immediately anchored to your home base currency (INR) using live FX rates to avoid fluctuating exchange rate disputes.',
        ruleOfThumb: 'Add a 2% buffer over live mid-market rates to account for credit card forex markup fees.',
      },
      {
        heading: '2. Smart Splitting Mechanics',
        explanation: 'Different expenses require different split models. Shared car rentals use equal splits, alcohol bills use exact shares, and hotel rooms use percentage allocations.',
        ruleOfThumb: 'Assign non-participating travelers to a zero share rather than creating separate sub-trips.',
      },
      {
        heading: '3. Minimal Settlement Graph Solver',
        explanation: 'Instead of every traveler paying every other traveler, our debt solver calculates net balances (Paid - Share) and resolves group debts in O(N) payments.',
        ruleOfThumb: 'Settle net balances at the end of the trip in a single round of UPI/bank transfers.',
      },
    ],
    practicalSteps: [
      'Create a Trip with destination, travel dates, and an overall budget cap.',
      'Add participants and group family members under single parent payers.',
      'Log expenses in real-time in local currency (e.g. VND in Vietnam, EUR in France).',
      'Visit the Settle Sub-Tab to view 1-click suggested payment transfers.',
    ],
    proTips: [
      'Use Pack & Prep templates to avoid duplicate emergency purchases abroad.',
    ],
  },
  {
    id: 'guide_portfolio',
    slug: 'portfolio-management',
    title: 'Multi-Asset Portfolio Architecture',
    tagline: 'Strategic asset allocation, rebalancing thresholds, and global equity exposure.',
    category: 'Growth',
    readTimeMinutes: 9,
    icon: 'TrendingUp',
    moduleTarget: 'portfolio-tracker',
    summary: 'Build a resilient multi-asset investment portfolio spanning Indian equities, US tech, debt mutual funds, sovereign gold bonds, and cash equivalents.',
    highlights: [
      'Multi-Asset coverage: Indian Equities, US Stocks, Mutual Funds, SGBs, Real Estate, Crypto',
      'Automated USD to INR conversion with live rate feeds',
      'Asset allocation donut visualizers and sector concentration metrics',
      'Annual portfolio rebalancing guidelines to harvest volatility',
    ],
    keyPrinciples: [
      {
        heading: '1. The Core & Satellite Strategy',
        explanation: 'Invest 70–80% of equity capital into broad-market low-cost index funds (Nifty 50, Nifty Next 50, S&P 500) as the Core, and 20–30% in high-conviction thematic or individual stocks as Satellite.',
        ruleOfThumb: 'Never let a single stock holding exceed 10% of your total equity portfolio.',
      },
      {
        heading: '2. Global Geographic Diversification',
        explanation: 'Holding 15–25% of your equity portfolio in US dollar assets provides a natural currency hedge against long-term INR depreciation (~3-4% p.a.).',
        ruleOfThumb: 'Use low-cost US index funds or fractional equity platforms to capture global GDP growth.',
      },
      {
        heading: '3. Dynamic 5/25 Rebalancing Rule',
        explanation: 'Rebalance asset classes when an allocation deviates by 5% in absolute terms or 25% in relative terms from your strategic asset allocation target.',
        ruleOfThumb: 'Rebalance using fresh monthly SIP cash flows to minimize capital gains tax.',
      },
    ],
    practicalSteps: [
      'Register your holdings with quantity, average buy price, and currency.',
      'Monitor your blended XIRR vs benchmark index returns.',
      'Review sector and market-cap concentration metrics regularly.',
    ],
    proTips: [
      'Automate monthly SIPs immediately after salary credits to practice pay-yourself-first.',
    ],
  },
  {
    id: 'guide_networth',
    slug: 'net-worth',
    title: 'Consolidated Balance Sheet & Net Worth',
    tagline: 'Liquid vs Illiquid assets, liability minimization, and compound growth trajectories.',
    category: 'Growth',
    readTimeMinutes: 7,
    icon: 'Layers',
    moduleTarget: 'net-worth',
    summary: 'Track your true financial scorecard: Total Assets minus Total Liabilities, and project long-term compound growth trajectories.',
    highlights: [
      'Unified balance sheet connecting Portfolio, Real Estate, Vault, and Bank accounts',
      'Live liability deductions from active EMI Manager mortgages and auto loans',
      'Compound growth and future value of annuity projection engines',
      'Financial Health Score benchmarking',
    ],
    keyPrinciples: [
      {
        heading: '1. Net Worth is the Only Real Scorecard',
        explanation: 'Income is vanity; cash flow is sanity; net worth is reality. Net Worth = Total Assets (liquid + fixed) - Total Liabilities (debt + loans).',
        ruleOfThumb: 'Track Net Worth monthly to observe the steady compounding of retained earnings.',
      },
      {
        heading: '2. Liquid vs Illiquid Asset Quality',
        explanation: 'A high net worth trapped entirely in non-income-generating real estate can cause severe liquidity crises. Aim for at least 40% of net worth in liquid financial assets.',
        ruleOfThumb: 'Liquid Net Worth = Stocks + MFs + Cash + Gold - Short-Term Debt.',
      },
      {
        heading: '3. Debt-to-Asset Health Ratio',
        explanation: 'Your total outstanding debt should never exceed 35% of your total gross asset value. As you near retirement, this ratio should trend towards 0%.',
        ruleOfThumb: 'Total Debt / Gross Assets < 0.35.',
      },
    ],
    practicalSteps: [
      'Audit all bank accounts, fixed deposits, properties, and precious metals.',
      'Link your EMI Manager loans so principal reductions automatically expand Net Worth.',
      'Run forward simulations to see projected net worth at ages 40, 50, and 60.',
    ],
    proTips: [
      'Update unlisted asset valuations (e.g. real estate) semi-annually rather than monthly.',
    ],
  },
  {
    id: 'guide_goals',
    slug: 'goals',
    title: 'Milestone Goals & Reverse SIP Engineering',
    tagline: 'Target corpus calculations, inflation adjustments, and reverse SIP engineering.',
    category: 'Growth',
    readTimeMinutes: 6,
    icon: 'Target',
    moduleTarget: 'goal-manager',
    summary: 'Turn vague financial dreams into mathematically precise monthly SIP mandates tailored to specific time horizons.',
    highlights: [
      'Inflation-adjusted Future Value calculations: FV = PV · (1 + i)^n',
      'Reverse SIP calculator computing exact monthly investment required',
      'Short-term (<3 yrs), Medium-term (3-7 yrs), and Long-term (>7 yrs) asset matching',
      'Goal linkage to Expense Tracker savings envelopes',
    ],
    keyPrinciples: [
      {
        heading: '1. Inflation-Adjusted Target Costing',
        explanation: 'A college education costing ₹25 Lakhs today will cost ₹64 Lakhs in 15 years at 6.5% education inflation. Always calculate future value with inflation.',
        ruleOfThumb: 'Use 6% inflation for general goals and 8-10% for education and healthcare goals.',
      },
      {
        heading: '2. Horizon-Matched Asset Allocation',
        explanation: 'Never invest goal funds in equities for horizons under 3 years. Use liquid funds (<1 yr), arbitrage/short debt (1-3 yrs), hybrid funds (3-7 yrs), and pure equity (>7 yrs).',
        ruleOfThumb: 'Short Horizon = High Capital Safety; Long Horizon = High Equity Compounding.',
      },
      {
        heading: '3. Step-Up SIP Compounding',
        explanation: 'Increasing your monthly SIP by just 10% each year reduces the initial required investment by over 40% and achieves goals years ahead of schedule.',
        ruleOfThumb: 'Step-up your SIP annually in tandem with your annual salary increment.',
      },
    ],
    practicalSteps: [
      'Define goals with specific target dates (e.g. Down Payment 2028, Kids Education 2038).',
      'Calculate the required monthly SIP using target expected returns.',
      'Tag monthly investments in Expense Tracker with the Goal ID.',
    ],
    proTips: [
      'De-risk equity goals into fixed-income instruments 2 years before the target date.',
    ],
  },
  {
    id: 'guide_fire',
    slug: 'retirement-and-fire',
    title: 'Retirement Modeling & The FIRE Roadmap',
    tagline: 'Safe withdrawal rates, Coast FIRE, Lean FIRE, and longevity risk mitigation.',
    category: 'Growth',
    readTimeMinutes: 8,
    icon: 'Flame',
    moduleTarget: 'fire-planner',
    summary: 'Plan your path to Financial Independence & Early Retirement (FIRE) using safe withdrawal rates and personalized freedom milestones.',
    highlights: [
      'The 25x Annual Expense Rule and Trinity Study 4% Safe Withdrawal Rate (SWR)',
      'FIRE Flavors: Regular FIRE, Lean FIRE, Fat FIRE, and Coast FIRE',
      'Sequence of Returns Risk (SRR) mitigation strategies',
      'Post-retirement bucket strategy for lifetime cash flow certainty',
    ],
    keyPrinciples: [
      {
        heading: '1. The FIRE Target Number (25x Rule)',
        explanation: 'Your financial freedom target is 25 times your annual living expenses (equivalent to a 4% Safe Withdrawal Rate). For 30+ year early retirements in India, a conservative 3.25% - 3.5% SWR (30x expenses) is recommended.',
        ruleOfThumb: 'Target Corpus = Annual Living Expenses × 30.',
      },
      {
        heading: '2. Understanding the FIRE Flavors',
        explanation: 'Lean FIRE covers basic barebones survival; Fat FIRE funds luxury lifestyle; Coast FIRE means your existing investments will grow to fund retirement without saving another rupee.',
        ruleOfThumb: 'Achieve Coast FIRE first to liberate yourself from high-stress jobs.',
      },
      {
        heading: '3. The 3-Bucket Post-Retirement Strategy',
        explanation: 'Divide retirement corpus into 3 buckets: Bucket 1 (1-3 yrs expenses in Cash/FD), Bucket 2 (4-7 yrs in High-Quality Debt), Bucket 3 (8+ yrs in Growth Equities).',
        ruleOfThumb: 'Bucket 1 shields you from ever selling equities during market downturns.',
      },
    ],
    practicalSteps: [
      'Input your current annual living expenses and age in FIRE Planner.',
      'Select your target retirement age and desired lifestyle tier.',
      'Review your calculated "Freedom Date" and current FIRE Progress percentage.',
    ],
    proTips: [
      'Factor in comprehensive health insurance and critical illness cover outside your FIRE corpus.',
    ],
  },
];
