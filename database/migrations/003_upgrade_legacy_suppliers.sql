-- Run this only when upgrading the original supplier contact table.
-- Existing supplier rows are preserved while the table is aligned with the
-- operational directory used by the application.

USE accounting_db;

ALTER TABLE suppliers
    CHANGE COLUMN name business_name VARCHAR(150) NOT NULL,
    CHANGE COLUMN description products_supplied VARCHAR(500) NULL,
    CHANGE COLUMN is_primary is_preferred BOOLEAN NOT NULL DEFAULT FALSE,
    MODIFY COLUMN status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    ADD COLUMN delivery_days VARCHAR(150) NULL AFTER products_supplied,
    ADD COLUMN lead_time_days SMALLINT UNSIGNED NULL AFTER delivery_days,
    ADD COLUMN minimum_order DECIMAL(15,2) NOT NULL DEFAULT 0.00 AFTER lead_time_days,
    ADD COLUMN notes VARCHAR(1000) NULL AFTER status,
    ADD COLUMN created_by VARCHAR(100) NOT NULL DEFAULT 'System User' AFTER notes,
    ADD COLUMN archived_at TIMESTAMP NULL DEFAULT NULL AFTER updated_at,
    ADD CONSTRAINT chk_suppliers_minimum_order_nonnegative CHECK (minimum_order >= 0),
    ADD INDEX idx_suppliers_business_name (business_name),
    ADD INDEX idx_suppliers_category (category),
    ADD INDEX idx_suppliers_preferred (is_preferred);
