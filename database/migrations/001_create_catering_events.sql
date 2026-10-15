-- Run this migration manually against the existing accounting_db database.
-- It creates a separate table and does not modify existing accounting tables.

USE accounting_db;

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
