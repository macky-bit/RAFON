-- Run once on an existing accounting_db before posting titled journal entries.
USE accounting_db;

ALTER TABLE journal_entries ADD COLUMN title VARCHAR(150) NOT NULL DEFAULT '' AFTER reference_number;
UPDATE journal_entries SET title = LEFT(explanation, 150) WHERE title = '';
