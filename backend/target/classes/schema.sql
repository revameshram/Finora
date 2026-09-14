-- ==============================================================================
-- Finora Shared Foundation: Umbrella User / Profile Schema
-- Compatible with PostgreSQL (Supabase) and H2 in-memory test database
-- ==============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    base_currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    avatar_url VARCHAR(512),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- ==============================================================================
-- Trip Manager Module Schema
-- ==============================================================================

CREATE TABLE IF NOT EXISTS tr_trips (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    destination VARCHAR(255),
    departure_location VARCHAR(255),
    adults_count INT NOT NULL DEFAULT 1,
    kids_count INT NOT NULL DEFAULT 0,
    start_date DATE,
    end_date DATE,
    hotel_preference VARCHAR(128),
    additional_details TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'UPCOMING',
    total_budget DECIMAL(19,4) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tr_participants (
    id VARCHAR(64) PRIMARY KEY,
    trip_id VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(128),
    mobile VARCHAR(32),
    dob DATE,
    preferred_language VARCHAR(64),
    food_preferences VARCHAR(128),
    category VARCHAR(32) NOT NULL DEFAULT 'TOURIST',
    parent_participant_id VARCHAR(64),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tr_plan_stops (
    id VARCHAR(64) PRIMARY KEY,
    trip_id VARCHAR(64) NOT NULL,
    stop_date DATE NOT NULL,
    stop_time VARCHAR(16),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(32) NOT NULL DEFAULT 'ACTIVITY',
    location VARCHAR(255),
    description TEXT,
    estimated_cost DECIMAL(19,4) DEFAULT 0,
    assigned_participant_ids TEXT,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tr_category_budgets (
    id VARCHAR(64) PRIMARY KEY,
    trip_id VARCHAR(64) NOT NULL,
    category VARCHAR(32) NOT NULL,
    budget_amount DECIMAL(19,4) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tr_expenses (
    id VARCHAR(64) PRIMARY KEY,
    trip_id VARCHAR(64) NOT NULL,
    payer_id VARCHAR(64),
    description VARCHAR(255) NOT NULL,
    category VARCHAR(32) NOT NULL DEFAULT 'MISCELLANEOUS',
    amount DECIMAL(19,4) NOT NULL DEFAULT 0,
    original_currency VARCHAR(8) DEFAULT 'INR',
    original_amount DECIMAL(19,4),
    expense_date DATE NOT NULL,
    payment_status VARCHAR(32) DEFAULT 'PAID',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tr_expense_splits (
    id VARCHAR(64) PRIMARY KEY,
    expense_id VARCHAR(64) NOT NULL,
    participant_id VARCHAR(64) NOT NULL,
    split_type VARCHAR(32) NOT NULL DEFAULT 'EQUAL',
    split_value DECIMAL(19,4) DEFAULT 1,
    computed_amount DECIMAL(19,4) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tr_expense_payments (
    id VARCHAR(64) PRIMARY KEY,
    trip_id VARCHAR(64) NOT NULL,
    expense_id VARCHAR(64),
    from_participant_id VARCHAR(64) NOT NULL,
    to_participant_id VARCHAR(64) NOT NULL,
    amount DECIMAL(19,4) NOT NULL DEFAULT 0,
    payment_method VARCHAR(64) DEFAULT 'UPI',
    payment_date DATE NOT NULL,
    payment_status VARCHAR(32) DEFAULT 'COMPLETED',
    reference_id VARCHAR(64),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tr_packing_items (
    id VARCHAR(64) PRIMARY KEY,
    trip_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(32) NOT NULL DEFAULT 'ESSENTIALS',
    packed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tr_checklist_items (
    id VARCHAR(64) PRIMARY KEY,
    trip_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) DEFAULT 'General',
    priority VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
    due_date DATE,
    assigned_participant_id VARCHAR(64),
    description TEXT,
    done BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- EMI Manager Module Schema
-- ==============================================================================

CREATE TABLE IF NOT EXISTS em_loans (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    loan_name VARCHAR(128) NOT NULL,
    loan_type VARCHAR(32) NOT NULL,
    lender_name VARCHAR(128),
    account_number_masked VARCHAR(64),
    sanctioned_amount DECIMAL(15,2) NOT NULL,
    current_outstanding DECIMAL(15,2) NOT NULL,
    annual_interest_rate DECIMAL(6,3) NOT NULL,
    tenure_months INT NOT NULL,
    start_date DATE NOT NULL,
    monthly_emi DECIMAL(15,2) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    linked_net_worth_liability_id VARCHAR(64),
    notes TEXT,
    is_included BOOLEAN DEFAULT TRUE,
    is_linked BOOLEAN DEFAULT FALSE,
    source_module VARCHAR(32) DEFAULT 'MANUAL',
    source_entity_id VARCHAR(64),
    linked_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS em_loan_prepayments (
    id VARCHAR(64) PRIMARY KEY,
    loan_id VARCHAR(64) NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    prepayment_type VARCHAR(32) NOT NULL DEFAULT 'ONE_TIME',
    impact VARCHAR(32) NOT NULL DEFAULT 'REDUCE_TENURE',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS em_loan_emi_logs (
    id VARCHAR(64) PRIMARY KEY,
    loan_id VARCHAR(64) NOT NULL,
    installment_number INT NOT NULL,
    due_date DATE NOT NULL,
    emi_amount DECIMAL(15,2) NOT NULL,
    principal_component DECIMAL(15,2) NOT NULL,
    interest_component DECIMAL(15,2) NOT NULL,
    prepayment_amount DECIMAL(15,2) DEFAULT 0,
    outstanding_balance DECIMAL(15,2) NOT NULL,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    paid_date DATE,
    linked_expense_transaction_id VARCHAR(64),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- Net Worth Tracker Module Schema
-- ==============================================================================

CREATE TABLE IF NOT EXISTS nw_assets (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    asset_value DECIMAL(19,4) NOT NULL DEFAULT 0,
    acquired_date DATE,
    growth_rate_pct DECIMAL(5,2) DEFAULT 0,
    recurring_investment DECIMAL(19,4) DEFAULT 0,
    notes TEXT,
    is_included BOOLEAN DEFAULT TRUE,
    is_linked BOOLEAN DEFAULT FALSE,
    source_module VARCHAR(32) DEFAULT 'MANUAL',
    source_entity_id VARCHAR(64),
    linked_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nw_liabilities (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    amount DECIMAL(19,4) NOT NULL DEFAULT 0,
    incurred_date DATE,
    interest_rate_pct DECIMAL(5,2) DEFAULT 0,
    recurring_payment DECIMAL(19,4) DEFAULT 0,
    notes TEXT,
    is_included BOOLEAN DEFAULT TRUE,
    is_linked BOOLEAN DEFAULT FALSE,
    source_module VARCHAR(32) DEFAULT 'MANUAL',
    source_entity_id VARCHAR(64),
    linked_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nw_snapshots (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    snapshot_date DATE NOT NULL,
    total_assets DECIMAL(19,4) NOT NULL DEFAULT 0,
    total_liabilities DECIMAL(19,4) NOT NULL DEFAULT 0,
    net_worth DECIMAL(19,4) NOT NULL DEFAULT 0,
    health_score INT NOT NULL DEFAULT 100,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nw_growth_scenarios (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    cagr_pct DECIMAL(5,2) NOT NULL,
    doubles_in_years INT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- Goal Manager Module Schema
-- ==============================================================================

CREATE TABLE IF NOT EXISTS gm_goals (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    priority VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
    target_amount DECIMAL(19,4) NOT NULL DEFAULT 0,
    target_is_future_value BOOLEAN DEFAULT FALSE,
    target_date DATE NOT NULL,
    inflation_rate_pct DECIMAL(5,2) DEFAULT 6.0,
    expected_annual_return_pct DECIMAL(5,2) DEFAULT 10.0,
    contribution_frequency VARCHAR(32) DEFAULT 'MONTHLY',
    starting_balance DECIMAL(19,4) DEFAULT 0,
    account_label VARCHAR(128),
    current_value DECIMAL(19,4) DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    is_included BOOLEAN DEFAULT TRUE,
    is_linked BOOLEAN DEFAULT FALSE,
    source_module VARCHAR(32) DEFAULT 'MANUAL',
    source_entity_id VARCHAR(64),
    linked_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gm_contributions (
    id VARCHAR(64) PRIMARY KEY,
    goal_id VARCHAR(64) NOT NULL,
    contribution_type VARCHAR(32) NOT NULL DEFAULT 'CONTRIBUTION',
    amount DECIMAL(19,4) NOT NULL DEFAULT 0,
    contribution_date DATE NOT NULL,
    note TEXT,
    source_type VARCHAR(32) NOT NULL DEFAULT 'MANUAL',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gm_investment_links (
    id VARCHAR(64) PRIMARY KEY,
    goal_id VARCHAR(64) NOT NULL,
    portfolio_asset_id VARCHAR(64) NOT NULL,
    linked_profile_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gm_tags (
    id VARCHAR(64) PRIMARY KEY,
    goal_id VARCHAR(64) NOT NULL,
    expense_transaction_id VARCHAR(64) NOT NULL,
    tagged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gm_milestones (
    id VARCHAR(64) PRIMARY KEY,
    goal_id VARCHAR(64) NOT NULL,
    label VARCHAR(128) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tr_checklist_items (
    id VARCHAR(64) PRIMARY KEY,
    trip_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) DEFAULT 'General',
    priority VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
    due_date DATE,
    assigned_participant_id VARCHAR(64),
    description TEXT,
    done BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- EMI Manager Module Schema
-- ==============================================================================

CREATE TABLE IF NOT EXISTS em_loans (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    loan_name VARCHAR(128) NOT NULL,
    loan_type VARCHAR(32) NOT NULL,
    lender_name VARCHAR(128),
    account_number_masked VARCHAR(64),
    sanctioned_amount DECIMAL(15,2) NOT NULL,
    current_outstanding DECIMAL(15,2) NOT NULL,
    annual_interest_rate DECIMAL(6,3) NOT NULL,
    tenure_months INT NOT NULL,
    start_date DATE NOT NULL,
    monthly_emi DECIMAL(15,2) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    linked_net_worth_liability_id VARCHAR(64),
    notes TEXT,
    is_included BOOLEAN DEFAULT TRUE,
    is_linked BOOLEAN DEFAULT FALSE,
    source_module VARCHAR(32) DEFAULT 'MANUAL',
    source_entity_id VARCHAR(64),
    linked_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS em_loan_prepayments (
    id VARCHAR(64) PRIMARY KEY,
    loan_id VARCHAR(64) NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    prepayment_type VARCHAR(32) NOT NULL DEFAULT 'ONE_TIME',
    impact VARCHAR(32) NOT NULL DEFAULT 'REDUCE_TENURE',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS em_loan_emi_logs (
    id VARCHAR(64) PRIMARY KEY,
    loan_id VARCHAR(64) NOT NULL,
    installment_number INT NOT NULL,
    due_date DATE NOT NULL,
    emi_amount DECIMAL(15,2) NOT NULL,
    principal_component DECIMAL(15,2) NOT NULL,
    interest_component DECIMAL(15,2) NOT NULL,
    prepayment_amount DECIMAL(15,2) DEFAULT 0,
    outstanding_balance DECIMAL(15,2) NOT NULL,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    paid_date DATE,
    linked_expense_transaction_id VARCHAR(64),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- Net Worth Tracker Module Schema
-- ==============================================================================

CREATE TABLE IF NOT EXISTS nw_assets (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    asset_value DECIMAL(19,4) NOT NULL DEFAULT 0,
    acquired_date DATE,
    growth_rate_pct DECIMAL(5,2) DEFAULT 0,
    recurring_investment DECIMAL(19,4) DEFAULT 0,
    notes TEXT,
    is_included BOOLEAN DEFAULT TRUE,
    is_linked BOOLEAN DEFAULT FALSE,
    source_module VARCHAR(32) DEFAULT 'MANUAL',
    source_entity_id VARCHAR(64),
    linked_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nw_liabilities (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    amount DECIMAL(19,4) NOT NULL DEFAULT 0,
    incurred_date DATE,
    interest_rate_pct DECIMAL(5,2) DEFAULT 0,
    recurring_payment DECIMAL(19,4) DEFAULT 0,
    notes TEXT,
    is_included BOOLEAN DEFAULT TRUE,
    is_linked BOOLEAN DEFAULT FALSE,
    source_module VARCHAR(32) DEFAULT 'MANUAL',
    source_entity_id VARCHAR(64),
    linked_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nw_snapshots (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    snapshot_date DATE NOT NULL,
    total_assets DECIMAL(19,4) NOT NULL DEFAULT 0,
    total_liabilities DECIMAL(19,4) NOT NULL DEFAULT 0,
    net_worth DECIMAL(19,4) NOT NULL DEFAULT 0,
    health_score INT NOT NULL DEFAULT 100,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nw_growth_scenarios (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    cagr_pct DECIMAL(5,2) NOT NULL,
    doubles_in_years INT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- Goal Manager Module Schema
-- ==============================================================================

CREATE TABLE IF NOT EXISTS gm_goals (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    priority VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
    target_amount DECIMAL(19,4) NOT NULL DEFAULT 0,
    target_is_future_value BOOLEAN DEFAULT FALSE,
    target_date DATE NOT NULL,
    inflation_rate_pct DECIMAL(5,2) DEFAULT 6.0,
    expected_annual_return_pct DECIMAL(5,2) DEFAULT 10.0,
    contribution_frequency VARCHAR(32) DEFAULT 'MONTHLY',
    starting_balance DECIMAL(19,4) DEFAULT 0,
    account_label VARCHAR(128),
    current_value DECIMAL(19,4) DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    is_included BOOLEAN DEFAULT TRUE,
    is_linked BOOLEAN DEFAULT FALSE,
    source_module VARCHAR(32) DEFAULT 'MANUAL',
    source_entity_id VARCHAR(64),
    linked_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gm_contributions (
    id VARCHAR(64) PRIMARY KEY,
    goal_id VARCHAR(64) NOT NULL,
    contribution_type VARCHAR(32) NOT NULL DEFAULT 'CONTRIBUTION',
    amount DECIMAL(19,4) NOT NULL DEFAULT 0,
    contribution_date DATE NOT NULL,
    note TEXT,
    source_type VARCHAR(32) NOT NULL DEFAULT 'MANUAL',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gm_investment_links (
    id VARCHAR(64) PRIMARY KEY,
    goal_id VARCHAR(64) NOT NULL,
    portfolio_asset_id VARCHAR(64) NOT NULL,
    linked_profile_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gm_tags (
    id VARCHAR(64) PRIMARY KEY,
    goal_id VARCHAR(64) NOT NULL,
    expense_transaction_id VARCHAR(64) NOT NULL,
    tagged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gm_milestones (
    id VARCHAR(64) PRIMARY KEY,
    goal_id VARCHAR(64) NOT NULL,
    label VARCHAR(128) NOT NULL,
    target_pct DECIMAL(5,2) NOT NULL,
    achieved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gm_settings (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE,
    monthly_savings_capacity DECIMAL(19,4) NOT NULL DEFAULT 50000,
    behind_schedule_threshold_pct DECIMAL(5,2) NOT NULL DEFAULT 10.0,
    default_inflation_rate_pct DECIMAL(5,2) NOT NULL DEFAULT 6.0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- FIRE Planner Module Schema
-- ==============================================================================

CREATE TABLE IF NOT EXISTS fp_plans (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE,
    current_savings_source VARCHAR(32) NOT NULL DEFAULT 'MANUAL',
    manual_current_savings DECIMAL(19,4) DEFAULT 0,
    current_age INT,
    target_retirement_age INT,
    monthly_savings DECIMAL(19,4) NOT NULL DEFAULT 0,
    expected_annual_return_pct DECIMAL(5,2) NOT NULL DEFAULT 12.00,
    post_retirement_return_pct DECIMAL(5,2) NOT NULL DEFAULT 8.00,
    annual_expenses_in_retirement DECIMAL(19,4) NOT NULL DEFAULT 0,
    safe_withdrawal_rate_pct DECIMAL(5,2) NOT NULL DEFAULT 4.00,
    expected_annual_inflation_pct DECIMAL(5,2) NOT NULL DEFAULT 6.00,
    active_mode VARCHAR(32) NOT NULL DEFAULT 'YEARS_TO_FIRE',
    notes TEXT,
    is_included BOOLEAN DEFAULT TRUE,
    is_linked BOOLEAN DEFAULT FALSE,
    source_module VARCHAR(32) DEFAULT 'MANUAL',
    source_entity_id VARCHAR(64),
    linked_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fp_snapshots (
    id VARCHAR(64) PRIMARY KEY,
    fire_plan_id VARCHAR(64) NOT NULL,
    computed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fire_number DECIMAL(19,4) NOT NULL DEFAULT 0,
    years_to_fire DECIMAL(5,2),
    required_monthly_savings DECIMAL(19,4)
);
