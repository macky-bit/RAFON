START TRANSACTION;

CREATE TEMPORARY TABLE desired_accounts (
    code VARCHAR(20) PRIMARY KEY,
    title VARCHAR(150) NOT NULL UNIQUE,
    category ENUM('Asset', 'Liability', 'Equity', 'Revenue', 'Expense') NOT NULL,
    normal_balance ENUM('Debit', 'Credit') NOT NULL
);

INSERT INTO desired_accounts (code, title, category, normal_balance) VALUES
    ('110', 'Cash on Hand & Bank', 'Asset', 'Debit'),
    ('120', 'Accounts Receivable', 'Asset', 'Debit'),
    ('125', 'Allowance for Bad Debts', 'Asset', 'Credit'),
    ('130', 'Notes Receivable', 'Asset', 'Debit'),
    ('140', 'Food & Beverage Inventory', 'Asset', 'Debit'),
    ('145', 'Prepaid Rent, Insurance & Supplies', 'Asset', 'Debit'),
    ('150', 'Kitchen Equipment & Appliances', 'Asset', 'Debit'),
    ('155', 'Accumulated Depreciation - Kitchen Equipment & Appliances', 'Asset', 'Credit'),
    ('160', 'Land', 'Asset', 'Debit'),
    ('170', 'Building', 'Asset', 'Debit'),
    ('175', 'Accumulated Depreciation - Building', 'Asset', 'Credit'),
    ('210', 'Accounts Payable', 'Liability', 'Credit'),
    ('220', 'Utilities Payable', 'Liability', 'Credit'),
    ('230', 'Notes Payable', 'Liability', 'Credit'),
    ('240', 'Interest Payable', 'Liability', 'Credit'),
    ('250', 'Salaries Payable', 'Liability', 'Credit'),
    ('260', 'Taxes Payable (VAT / Percentage Tax)', 'Liability', 'Credit'),
    ('270', 'Unearned Revenue (Customer Deposits)', 'Liability', 'Credit'),
    ('310', 'Rafon, Capital', 'Equity', 'Credit'),
    ('320', 'Rafon, Drawing', 'Equity', 'Debit'),
    ('410', 'Restaurant & Seafood Sales', 'Revenue', 'Credit'),
    ('420', 'Catering Services Income', 'Revenue', 'Credit'),
    ('510', 'Cost of Seafood & Food Ingredients', 'Expense', 'Debit'),
    ('515', 'Freight-Out & Delivery Expense', 'Expense', 'Debit'),
    ('520', 'Salaries & Staff Wages Expense', 'Expense', 'Debit'),
    ('525', 'Supplies Expense (Disposables & Packaging)', 'Expense', 'Debit'),
    ('530', 'Utilities & Power Expense', 'Expense', 'Debit'),
    ('540', 'Rent Expense', 'Expense', 'Debit'),
    ('545', 'Bad Debt Expense', 'Expense', 'Debit'),
    ('550', 'Advertising Expense', 'Expense', 'Debit'),
    ('560', 'Taxes & Licenses', 'Expense', 'Debit'),
    ('570', 'Interest Expense', 'Expense', 'Debit'),
    ('575', 'Depreciation Expense', 'Expense', 'Debit'),
    ('580', 'Food Spoilage & Wastage Expense', 'Expense', 'Debit'),
    ('585', 'Repairs & Maintenance Expense', 'Expense', 'Debit');

-- Free target codes first so accounts can move without unique-key collisions.
UPDATE accounts a
INNER JOIN desired_accounts d ON d.code = a.code
SET a.code = CONCAT('legacy-', a.id), a.is_active = FALSE;

UPDATE accounts
SET title = 'Prepaid Rent, Insurance & Supplies'
WHERE title = 'Prepaid Rent & Insurance';

-- Preserve existing account IDs and their journal-line relationships.
UPDATE accounts a
INNER JOIN desired_accounts d ON d.title = a.title
SET a.code = d.code,
    a.category = d.category,
    a.normal_balance = d.normal_balance,
    a.is_active = TRUE;

INSERT INTO accounts (code, title, category, normal_balance, is_active)
SELECT code, title, category, normal_balance, TRUE
FROM desired_accounts
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    category = VALUES(category),
    normal_balance = VALUES(normal_balance),
    is_active = TRUE;

UPDATE accounts a
LEFT JOIN desired_accounts d ON d.title = a.title
SET a.is_active = FALSE
WHERE d.code IS NULL;

-- Remove obsolete seed accounts only when no journal history references them.
DELETE a
FROM accounts a
LEFT JOIN journal_lines jl ON jl.account_id = a.id
WHERE a.is_active = FALSE
  AND jl.id IS NULL
  AND a.title IN ('Prepaid Supplies', 'Rent Income', 'Interest Income', 'Gains', 'Losses');

DROP TEMPORARY TABLE desired_accounts;

COMMIT;
