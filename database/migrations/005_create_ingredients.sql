-- Run this migration against the existing accounting_db database.
-- It creates ingredient inventory storage without inserting mock rows.

USE accounting_db;

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
