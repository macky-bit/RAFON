-- Run once on an existing accounting_db to number journals independently of row IDs.
USE accounting_db;

ALTER TABLE journal_entries ADD COLUMN journal_number BIGINT UNSIGNED NULL AFTER id;
SET @journal_number := 0;
UPDATE journal_entries SET journal_number = (@journal_number := @journal_number + 1) ORDER BY id;
ALTER TABLE journal_entries MODIFY journal_number BIGINT UNSIGNED NOT NULL;
ALTER TABLE journal_entries ADD CONSTRAINT uq_journal_entries_number UNIQUE (journal_number);

CREATE TABLE journal_number_counter (
    id TINYINT UNSIGNED PRIMARY KEY,
    next_number BIGINT UNSIGNED NOT NULL
) ENGINE=InnoDB;
INSERT INTO journal_number_counter (id, next_number)
SELECT 1, COALESCE(MAX(journal_number), 0) + 1 FROM journal_entries;
