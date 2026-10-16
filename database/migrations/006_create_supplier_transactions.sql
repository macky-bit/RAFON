-- Run this migration against the existing accounting_db database.

USE accounting_db;

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
