START TRANSACTION;

-- Preserve account IDs so existing journal lines keep their references.
UPDATE accounts
SET code = CASE title
    WHEN 'Cash on Hand & Bank' THEN '110'
    WHEN 'Accounts Receivable' THEN '120'
    WHEN 'Allowance for Bad Debts' THEN '125'
    WHEN 'Food & Beverage Inventory' THEN '130'
    WHEN 'Notes Receivable' THEN '135'
    WHEN 'Prepaid Rent & Insurance' THEN '140'
    WHEN 'Kitchen Equipment & Appliances' THEN '150'
    WHEN 'Accumulated Depreciation - Kitchen Equipment & Appliances' THEN '155'
    WHEN 'Prepaid Supplies' THEN '160'
    WHEN 'Land' THEN '170'
    WHEN 'Building' THEN '180'
    WHEN 'Accumulated Depreciation - Building' THEN '190'
    WHEN 'Accounts Payable' THEN '210'
    WHEN 'Utilities Payable' THEN '220'
    WHEN 'Notes Payable' THEN '230'
    WHEN 'Interest Payable' THEN '240'
    WHEN 'Salaries Payable' THEN '250'
    WHEN 'Rafon, Capital' THEN '310'
    WHEN 'Rafon, Drawing' THEN '320'
    WHEN 'Restaurant & Seafood Sales' THEN '410'
    WHEN 'Catering Services Income' THEN '420'
    WHEN 'Rent Income' THEN '430'
    WHEN 'Interest Income' THEN '440'
    WHEN 'Gains' THEN '450'
    WHEN 'Cost of Seafood & Food Ingredients' THEN '510'
    WHEN 'Freight-Out & Delivery Expense' THEN '515'
    WHEN 'Salaries & Staff Wages Expense' THEN '520'
    WHEN 'Utilities & Power Expense' THEN '530'
    WHEN 'Rent Expense' THEN '540'
    WHEN 'Bad Debt Expense' THEN '545'
    WHEN 'Advertising Expense' THEN '550'
    WHEN 'Taxes & Licenses' THEN '560'
    WHEN 'Interest Expense' THEN '570'
    WHEN 'Losses' THEN '580'
    ELSE code
END
WHERE title IN (
    'Cash on Hand & Bank',
    'Accounts Receivable',
    'Allowance for Bad Debts',
    'Food & Beverage Inventory',
    'Notes Receivable',
    'Prepaid Rent & Insurance',
    'Kitchen Equipment & Appliances',
    'Accumulated Depreciation - Kitchen Equipment & Appliances',
    'Prepaid Supplies',
    'Land',
    'Building',
    'Accumulated Depreciation - Building',
    'Accounts Payable',
    'Utilities Payable',
    'Notes Payable',
    'Interest Payable',
    'Salaries Payable',
    'Rafon, Capital',
    'Rafon, Drawing',
    'Restaurant & Seafood Sales',
    'Catering Services Income',
    'Rent Income',
    'Interest Income',
    'Gains',
    'Cost of Seafood & Food Ingredients',
    'Freight-Out & Delivery Expense',
    'Salaries & Staff Wages Expense',
    'Utilities & Power Expense',
    'Rent Expense',
    'Bad Debt Expense',
    'Advertising Expense',
    'Taxes & Licenses',
    'Interest Expense',
    'Losses'
);

INSERT INTO accounts (code, title, category, normal_balance) VALUES
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
    ('210', 'Accounts Payable', 'Liability', 'Credit'),
    ('220', 'Utilities Payable', 'Liability', 'Credit'),
    ('230', 'Notes Payable', 'Liability', 'Credit'),
    ('240', 'Interest Payable', 'Liability', 'Credit'),
    ('250', 'Salaries Payable', 'Liability', 'Credit'),
    ('310', 'Rafon, Capital', 'Equity', 'Credit'),
    ('320', 'Rafon, Drawing', 'Equity', 'Debit'),
    ('410', 'Restaurant & Seafood Sales', 'Revenue', 'Credit'),
    ('420', 'Catering Services Income', 'Revenue', 'Credit'),
    ('430', 'Rent Income', 'Revenue', 'Credit'),
    ('440', 'Interest Income', 'Revenue', 'Credit'),
    ('450', 'Gains', 'Revenue', 'Credit'),
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

COMMIT;
