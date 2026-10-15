-- Run this migration against the existing accounting_db database.
-- It creates the supplier directory table without changing accounting records.

USE accounting_db;

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
