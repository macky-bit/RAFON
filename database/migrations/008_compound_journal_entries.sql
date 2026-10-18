-- Run once on an existing accounting_db to allow multiple debit and credit lines.
USE accounting_db;

ALTER TABLE journal_lines ADD INDEX idx_journal_lines_entry_type (journal_entry_id, line_type);
ALTER TABLE journal_lines DROP INDEX uq_journal_entry_line_type;
