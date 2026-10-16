-- Rafon Ledger database schema and chart of accounts
-- Target database: MySQL 8.0+ / MariaDB 10.5+

CREATE DATABASE IF NOT EXISTS accounting_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE accounting_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(190) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Administrator', 'Accountant', 'Staff') NOT NULL DEFAULT 'Staff',
    status ENUM('Pending', 'Active', 'Disabled') NOT NULL DEFAULT 'Pending',
    email_verified_at TIMESTAMP NULL DEFAULT NULL,
    last_login_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_users_email UNIQUE (email),
    INDEX idx_users_status (status),
    INDEX idx_users_role (role)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auth_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    purpose ENUM('Remember', 'Password Reset', 'Email Verification') NOT NULL,
    selector CHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    expires_at DATETIME NOT NULL,
    consumed_at DATETIME NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_auth_tokens_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT uq_auth_tokens_selector UNIQUE (selector),
    INDEX idx_auth_tokens_user_purpose (user_id, purpose),
    INDEX idx_auth_tokens_expires_at (expires_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS accounts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    title VARCHAR(150) NOT NULL,
    category ENUM('Asset', 'Liability', 'Equity', 'Revenue', 'Expense') NOT NULL,
    normal_balance ENUM('Debit', 'Credit') NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_accounts_code UNIQUE (code),
    CONSTRAINT uq_accounts_title UNIQUE (title)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS journal_entries (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    entry_date DATE NOT NULL,
    reference_number VARCHAR(50) NOT NULL,
    explanation VARCHAR(500) NOT NULL,
    status ENUM('POSTED', 'VOID') NOT NULL DEFAULT 'POSTED',
    created_by VARCHAR(100) NOT NULL DEFAULT 'Senior Accountant',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_journal_entries_reference UNIQUE (reference_number),
    INDEX idx_journal_entries_date (entry_date),
    INDEX idx_journal_entries_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS journal_lines (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    journal_entry_id BIGINT UNSIGNED NOT NULL,
    account_id BIGINT UNSIGNED NOT NULL,
    line_type ENUM('Debit', 'Credit') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_journal_lines_entry
        FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_journal_lines_account
        FOREIGN KEY (account_id) REFERENCES accounts(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_journal_entry_line_type UNIQUE (journal_entry_id, line_type),
    CONSTRAINT chk_journal_lines_positive_amount CHECK (amount > 0),
    INDEX idx_journal_lines_account (account_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    reference_number VARCHAR(50) NOT NULL,
    details VARCHAR(500) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_logs_created_at (created_at),
    INDEX idx_audit_logs_reference (reference_number)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS catering_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(150) NOT NULL,
    client_name VARCHAR(150) NOT NULL,
    package_name VARCHAR(120) NOT NULL,
    event_date DATE NOT NULL,
    status ENUM('Upcoming', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Upcoming',
    total_revenue DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    estimated_cost DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    amount_paid DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    notes VARCHAR(500) NULL,
    created_by VARCHAR(100) NOT NULL DEFAULT 'System User',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_catering_revenue_nonnegative
        CHECK (total_revenue >= 0),
    CONSTRAINT chk_catering_cost_nonnegative
        CHECK (estimated_cost >= 0),
    CONSTRAINT chk_catering_paid_nonnegative
        CHECK (amount_paid >= 0),

    INDEX idx_catering_events_date (event_date),
    INDEX idx_catering_events_status (status),
    INDEX idx_catering_events_package (package_name)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS suppliers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    business_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    contact_person VARCHAR(150) NULL,
    phone VARCHAR(50) NULL,
    email VARCHAR(190) NULL,
    address VARCHAR(300) NULL,
    products_supplied VARCHAR(500) NULL,
    delivery_days VARCHAR(150) NULL,
    lead_time_days SMALLINT UNSIGNED NULL,
    minimum_order DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    is_preferred BOOLEAN NOT NULL DEFAULT FALSE,
    status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    notes VARCHAR(1000) NULL,
    created_by VARCHAR(100) NOT NULL DEFAULT 'System User',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    archived_at TIMESTAMP NULL DEFAULT NULL,

    CONSTRAINT chk_suppliers_minimum_order_nonnegative
        CHECK (minimum_order >= 0),

    INDEX idx_suppliers_business_name (business_name),
    INDEX idx_suppliers_category (category),
    INDEX idx_suppliers_status (status),
    INDEX idx_suppliers_preferred (is_preferred)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS supplier_transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    supplier_id BIGINT UNSIGNED NOT NULL,
    transaction_id VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description VARCHAR(500) NOT NULL,
    receipt_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_supplier_transactions_supplier
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT uq_supplier_transactions_transaction_id UNIQUE (transaction_id),

    INDEX idx_supplier_transactions_supplier_created (supplier_id, created_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ingredients (
    ingredient_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ingredient_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    supplier_id BIGINT UNSIGNED NULL,
    stock_quantity DECIMAL(12,3) NOT NULL DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    reorder_level DECIMAL(12,3) NOT NULL DEFAULT 0,
    stock_alert_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    image_path VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_ingredients_supplier
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_ingredients_stock_nonnegative CHECK (stock_quantity >= 0),
    CONSTRAINT chk_ingredients_cost_nonnegative CHECK (unit_cost >= 0),
    CONSTRAINT chk_ingredients_reorder_nonnegative CHECK (reorder_level >= 0),

    INDEX idx_ingredients_name (ingredient_name),
    INDEX idx_ingredients_category (category),
    INDEX idx_ingredients_supplier (supplier_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

INSERT INTO accounts (code, title, category, normal_balance) VALUES
    -- ASSETS
    ('110', 'Cash on Hand & Bank', 'Asset', 'Debit'),
    ('120', 'Accounts Receivable', 'Asset', 'Debit'),
    ('125', 'Allowance for Bad Debts', 'Asset', 'Credit'),
    ('130', 'Food & Beverage Inventory', 'Asset', 'Debit'),
    ('135', 'Notes Receivable', 'Asset', 'Debit'),
    ('140', 'Prepaid Rent & Insurance', 'Asset', 'Debit'),
    ('150', 'Kitchen Equipment & Appliances', 'Asset', 'Debit'),
    ('155', 'Accumulated Depreciation - Kitchen Equipment & Appliances', 'Asset', 'Credit'),
    ('160', 'Prepaid Supplies', 'Asset', 'Debit'),
    ('170', 'Land', 'Asset', 'Debit'),
    ('180', 'Building', 'Asset', 'Debit'),
    ('190', 'Accumulated Depreciation - Building', 'Asset', 'Credit'),

    -- LIABILITIES
    ('210', 'Accounts Payable', 'Liability', 'Credit'),
    ('220', 'Utilities Payable', 'Liability', 'Credit'),
    ('230', 'Notes Payable', 'Liability', 'Credit'),
    ('240', 'Interest Payable', 'Liability', 'Credit'),
    ('250', 'Salaries Payable', 'Liability', 'Credit'),

    -- EQUITY
    ('310', 'Rafon, Capital', 'Equity', 'Credit'),
    ('320', 'Rafon, Drawing', 'Equity', 'Debit'),

    -- REVENUE AND OTHER INCOME
    ('410', 'Restaurant & Seafood Sales', 'Revenue', 'Credit'),
    ('420', 'Catering Services Income', 'Revenue', 'Credit'),
    ('430', 'Rent Income', 'Revenue', 'Credit'),
    ('440', 'Interest Income', 'Revenue', 'Credit'),
    ('450', 'Gains', 'Revenue', 'Credit'),

    -- EXPENSES AND LOSSES
    ('510', 'Cost of Seafood & Food Ingredients', 'Expense', 'Debit'),
    ('515', 'Freight-Out & Delivery Expense', 'Expense', 'Debit'),
    ('520', 'Salaries & Staff Wages Expense', 'Expense', 'Debit'),
    ('530', 'Utilities & Power Expense', 'Expense', 'Debit'),
    ('540', 'Rent Expense', 'Expense', 'Debit'),
    ('545', 'Bad Debt Expense', 'Expense', 'Debit'),
    ('550', 'Advertising Expense', 'Expense', 'Debit'),
    ('560', 'Taxes & Licenses', 'Expense', 'Debit'),
    ('570', 'Interest Expense', 'Expense', 'Debit'),
    ('580', 'Losses', 'Expense', 'Debit')
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    category = VALUES(category),
    normal_balance = VALUES(normal_balance),
    is_active = TRUE;
