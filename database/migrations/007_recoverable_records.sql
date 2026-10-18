-- Run once on an existing accounting_db before using Backup & Recovery.
USE accounting_db;

ALTER TABLE ingredients ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
CREATE INDEX idx_ingredients_deleted_at ON ingredients (deleted_at);

ALTER TABLE catering_events ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
CREATE INDEX idx_catering_events_deleted_at ON catering_events (deleted_at);
