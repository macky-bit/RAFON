-- Apply to an existing Pormatch database after selecting that database.
-- Style Packs and featured promotions are proposed offers, not membership plans.
UPDATE `plans`
SET `monthly_price` = 79.00,
    `annual_price` = 699.00
WHERE `code` = 'premium';
