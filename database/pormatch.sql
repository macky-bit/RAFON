
CREATE DATABASE IF NOT EXISTS `pormatch`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `pormatch`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP VIEW IF EXISTS `v_user_generation_usage`;
DROP VIEW IF EXISTS `v_catalog_items`;
DROP VIEW IF EXISTS `v_outfit_colors`;
DROP TABLE IF EXISTS `user_memberships`;
DROP TABLE IF EXISTS `plans`;
DROP TABLE IF EXISTS `saved_outfits`;
DROP TABLE IF EXISTS `ranking_runs`;
DROP TABLE IF EXISTS `recommendation_results`;
DROP TABLE IF EXISTS `recommendation_requests`;
DROP TABLE IF EXISTS `outfit_colors`;
DROP TABLE IF EXISTS `outfit_items`;
DROP TABLE IF EXISTS `outfits`;
DROP TABLE IF EXISTS `catalog_item_sizes`;
DROP TABLE IF EXISTS `catalog_item_occasions`;
DROP TABLE IF EXISTS `catalog_item_styles`;
DROP TABLE IF EXISTS `catalog_items`;
DROP TABLE IF EXISTS `user_color_preferences`;
DROP TABLE IF EXISTS `user_style_preferences`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `sizes`;
DROP TABLE IF EXISTS `occasions`;
DROP TABLE IF EXISTS `colors`;
DROP TABLE IF EXISTS `styles`;
DROP TABLE IF EXISTS `fits`;
DROP TABLE IF EXISTS `categories`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `categories` (
  `category_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(40) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `uq_categories_name` (`name`)
) ENGINE=InnoDB;

CREATE TABLE `fits` (
  `fit_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(30) NOT NULL,
  PRIMARY KEY (`fit_id`),
  UNIQUE KEY `uq_fits_name` (`name`)
) ENGINE=InnoDB;

CREATE TABLE `styles` (
  `style_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(40) NOT NULL,
  PRIMARY KEY (`style_id`),
  UNIQUE KEY `uq_styles_name` (`name`)
) ENGINE=InnoDB;

CREATE TABLE `colors` (
  `color_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(40) NOT NULL,
  `hex_code` CHAR(7) NOT NULL,
  PRIMARY KEY (`color_id`),
  UNIQUE KEY `uq_colors_name` (`name`),
  UNIQUE KEY `uq_colors_hex` (`hex_code`)
) ENGINE=InnoDB;

CREATE TABLE `occasions` (
  `occasion_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`occasion_id`),
  UNIQUE KEY `uq_occasions_name` (`name`)
) ENGINE=InnoDB;

CREATE TABLE `sizes` (
  `size_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(12) NOT NULL,
  `display_order` SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (`size_id`),
  UNIQUE KEY `uq_sizes_code` (`code`),
  UNIQUE KEY `uq_sizes_order` (`display_order`)
) ENGINE=InnoDB;

CREATE TABLE `users` (
  `user_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(254) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('user','admin') NOT NULL DEFAULT 'user',
  `gender` ENUM('Woman','Man','Prefer not to say') NOT NULL DEFAULT 'Prefer not to say',
  `size_id` SMALLINT UNSIGNED NULL,
  `fit_id` TINYINT UNSIGNED NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_size` (`size_id`),
  KEY `idx_users_fit` (`fit_id`),
  CONSTRAINT `fk_users_size` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`size_id`) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `fk_users_fit` FOREIGN KEY (`fit_id`) REFERENCES `fits` (`fit_id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE `user_style_preferences` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `style_id` TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (`user_id`, `style_id`),
  CONSTRAINT `fk_user_style_preferences_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_user_style_preferences_style` FOREIGN KEY (`style_id`) REFERENCES `styles` (`style_id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `user_color_preferences` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `color_id` TINYINT UNSIGNED NOT NULL,
  `preference` ENUM('favorite','avoid') NOT NULL,
  PRIMARY KEY (`user_id`, `color_id`),
  KEY `idx_user_color_preference` (`color_id`, `preference`),
  CONSTRAINT `fk_user_color_preferences_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_user_color_preferences_color` FOREIGN KEY (`color_id`) REFERENCES `colors` (`color_id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `catalog_items` (
  `item_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sku` VARCHAR(40) NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `category_id` TINYINT UNSIGNED NOT NULL,
  `gender` ENUM('Woman','Man','Unisex') NOT NULL,
  `fit_id` TINYINT UNSIGNED NULL COMMENT 'NULL means suitable for all fits',
  `color_id` TINYINT UNSIGNED NOT NULL,
  `image_path` VARCHAR(500) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`item_id`),
  UNIQUE KEY `uq_catalog_items_sku` (`sku`),
  KEY `idx_catalog_filter` (`gender`, `category_id`, `fit_id`, `color_id`, `is_active`),
  CONSTRAINT `fk_catalog_items_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_catalog_items_fit` FOREIGN KEY (`fit_id`) REFERENCES `fits` (`fit_id`) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `fk_catalog_items_color` FOREIGN KEY (`color_id`) REFERENCES `colors` (`color_id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `catalog_item_styles` (
  `item_id` BIGINT UNSIGNED NOT NULL,
  `style_id` TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (`item_id`, `style_id`),
  CONSTRAINT `fk_catalog_item_styles_item` FOREIGN KEY (`item_id`) REFERENCES `catalog_items` (`item_id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_catalog_item_styles_style` FOREIGN KEY (`style_id`) REFERENCES `styles` (`style_id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `catalog_item_occasions` (
  `item_id` BIGINT UNSIGNED NOT NULL,
  `occasion_id` TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (`item_id`, `occasion_id`),
  KEY `idx_catalog_item_occasions_occasion` (`occasion_id`, `item_id`),
  CONSTRAINT `fk_catalog_item_occasions_item` FOREIGN KEY (`item_id`) REFERENCES `catalog_items` (`item_id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_catalog_item_occasions_occasion` FOREIGN KEY (`occasion_id`) REFERENCES `occasions` (`occasion_id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `catalog_item_sizes` (
  `item_id` BIGINT UNSIGNED NOT NULL,
  `size_id` SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (`item_id`, `size_id`),
  CONSTRAINT `fk_catalog_item_sizes_item` FOREIGN KEY (`item_id`) REFERENCES `catalog_items` (`item_id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_catalog_item_sizes_size` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`size_id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `outfits` (
  `outfit_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(100) NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `style_id` TINYINT UNSIGNED NOT NULL,
  `gender` ENUM('Woman','Man','Unisex') NOT NULL COMMENT 'Intended audience of the complete outfit',
  `fit_id` TINYINT UNSIGNED NOT NULL COMMENT 'Overall outfit silhouette',
  `base_score` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`outfit_id`),
  UNIQUE KEY `uq_outfits_slug` (`slug`),
  KEY `idx_outfits_filter` (`gender`, `fit_id`, `style_id`, `is_active`),
  CONSTRAINT `fk_outfits_style` FOREIGN KEY (`style_id`) REFERENCES `styles` (`style_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_outfits_fit` FOREIGN KEY (`fit_id`) REFERENCES `fits` (`fit_id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `outfit_items` (
  `outfit_id` BIGINT UNSIGNED NOT NULL,
  `item_id` BIGINT UNSIGNED NOT NULL,
  `display_order` TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (`outfit_id`, `item_id`),
  UNIQUE KEY `uq_outfit_item_order` (`outfit_id`, `display_order`),
  CONSTRAINT `fk_outfit_items_outfit` FOREIGN KEY (`outfit_id`) REFERENCES `outfits` (`outfit_id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_outfit_items_item` FOREIGN KEY (`item_id`) REFERENCES `catalog_items` (`item_id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `recommendation_requests` (
  `request_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `occasion_id` TINYINT UNSIGNED NOT NULL,
  `style_id` TINYINT UNSIGNED NOT NULL,
  `color_id` TINYINT UNSIGNED NOT NULL,
  `size_id` SMALLINT UNSIGNED NOT NULL,
  `fit_id` TINYINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`request_id`),
  KEY `idx_recommendation_history` (`user_id`, `created_at`),
  CONSTRAINT `fk_recommendation_requests_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_recommendation_requests_occasion` FOREIGN KEY (`occasion_id`) REFERENCES `occasions` (`occasion_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_recommendation_requests_style` FOREIGN KEY (`style_id`) REFERENCES `styles` (`style_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_recommendation_requests_color` FOREIGN KEY (`color_id`) REFERENCES `colors` (`color_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_recommendation_requests_size` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`size_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_recommendation_requests_fit` FOREIGN KEY (`fit_id`) REFERENCES `fits` (`fit_id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `recommendation_results` (
  `request_id` BIGINT UNSIGNED NOT NULL,
  `outfit_id` BIGINT UNSIGNED NOT NULL,
  `rank_position` TINYINT UNSIGNED NOT NULL,
  `match_score` DECIMAL(5,2) NOT NULL,
  `explanation` TEXT NULL,
  PRIMARY KEY (`request_id`, `outfit_id`),
  UNIQUE KEY `uq_recommendation_rank` (`request_id`, `rank_position`),
  CONSTRAINT `fk_recommendation_results_request` FOREIGN KEY (`request_id`) REFERENCES `recommendation_requests` (`request_id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_recommendation_results_outfit` FOREIGN KEY (`outfit_id`) REFERENCES `outfits` (`outfit_id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `saved_outfits` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `outfit_id` BIGINT UNSIGNED NOT NULL,
  `saved_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `outfit_id`),
  KEY `idx_saved_outfits_date` (`user_id`, `saved_at`),
  CONSTRAINT `fk_saved_outfits_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_saved_outfits_outfit` FOREIGN KEY (`outfit_id`) REFERENCES `outfits` (`outfit_id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `plans` (
  `plan_id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL,
  `name` VARCHAR(60) NOT NULL,
  `monthly_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `annual_price` DECIMAL(10,2) NULL,
  `generation_limit` SMALLINT UNSIGNED NULL COMMENT 'NULL means unlimited',
  `saved_limit` SMALLINT UNSIGNED NULL COMMENT 'NULL means unlimited',
  `history_limit` SMALLINT UNSIGNED NULL COMMENT 'NULL means unlimited',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`plan_id`),
  UNIQUE KEY `uq_plans_code` (`code`)
) ENGINE=InnoDB;

CREATE TABLE `user_memberships` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `plan_id` TINYINT UNSIGNED NOT NULL,
  `billing_cycle` ENUM('monthly','annual') NULL,
  `activated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` TIMESTAMP NULL,
  PRIMARY KEY (`user_id`),
  KEY `idx_user_memberships_plan` (`plan_id`),
  CONSTRAINT `fk_user_memberships_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_user_memberships_plan` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`plan_id`) ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO `categories` (`category_id`, `name`) VALUES
  (1, 'Top'), (2, 'Bottom'), (3, 'Outerwear'), (4, 'Dress'), (5, 'Shoes'), (6, 'Accessory');

INSERT INTO `fits` (`fit_id`, `name`) VALUES
  (1, 'Slim'), (2, 'Regular'), (3, 'Relaxed'), (4, 'Oversized');

INSERT INTO `styles` (`style_id`, `name`) VALUES
  (1, 'Casual'), (2, 'Smart Casual'), (3, 'Formal'), (4, 'Streetwear'), (5, 'Minimalist');

INSERT INTO `colors` (`color_id`, `name`, `hex_code`) VALUES
  (1, 'Deep teal', '#285D5B'),
  (2, 'White', '#FFFFFF'),
  (3, 'Black', '#202322'),
  (4, 'Muted gold', '#C49A5A'),
  (5, 'Sand', '#C7AD8B'),
  (6, 'Navy', '#25364A'),
  (7, 'Gray', '#7B7F82'),
  (8, 'Light blue', '#9FC4DF'),
  (9, 'Olive', '#6B7144'),
  (10, 'Brown', '#7A5138'),
  (11, 'Beige', '#D9C8AD'),
  (12, 'Burgundy', '#6F3345'),
  (13, 'Red', '#D93032'),
  (14, 'Blue', '#1557C0'),
  (15, 'Yellow', '#F2C318'),
  (16, 'Rust', '#A35D3D');

INSERT INTO `occasions` (`occasion_id`, `name`) VALUES
  (1, 'School'), (2, 'Work'), (3, 'Date'), (4, 'Gala'),
  (5, 'Special occasion');

INSERT INTO `sizes` (`size_id`, `code`, `display_order`) VALUES
  (1, 'XS', 10), (2, 'S', 20), (3, 'M', 30), (4, 'L', 40),
  (5, 'XL', 50), (6, '2XL', 60), (7, 'One size', 70),
  (8, '35', 135), (9, '36', 136), (10, '37', 137), (11, '38', 138),
  (12, '39', 139), (13, '40', 140), (14, '41', 141), (15, '42', 142),
  (16, '43', 143), (17, '44', 144), (18, '45', 145);

INSERT INTO `plans`
  (`plan_id`, `code`, `name`, `monthly_price`, `annual_price`, `generation_limit`, `saved_limit`, `history_limit`)
VALUES
  (1, 'free', 'Free', 0.00, 0.00, 5, 6, 3),
  (2, 'premium', 'Premium', 79.00, 699.00, NULL, NULL, NULL);

INSERT INTO `catalog_items`
  (`item_id`, `sku`, `name`, `category_id`, `gender`, `fit_id`, `color_id`, `image_path`)
VALUES
  (1, 'UNI-OUT-001', 'Deep Teal Regular Overshirt', 3, 'Unisex', 2, 1, 'assets/items/unisex-teal-overshirt.png'),
  (2, 'UNI-SHO-001', 'White Low-top Sneakers', 5, 'Unisex', NULL, 2, 'assets/items/unisex-white-sneakers.png'),
  (3, 'UNI-ACC-001', 'Structured Black Tote', 6, 'Unisex', NULL, 3, 'assets/items/unisex-black-tote.png'),
  (4, 'UNI-ACC-002', 'Muted Gold Watch', 6, 'Unisex', NULL, 4, 'assets/items/unisex-gold-watch.png'),
  (5, 'MEN-TOP-001', 'Men''s Regular Ivory Tee', 1, 'Man', 2, 2, 'assets/items/men-ivory-tee.png'),
  (6, 'MEN-BOT-001', 'Men''s Regular Khaki Trousers', 2, 'Man', 2, 5, 'assets/items/men-khaki-trousers.png'),
  (7, 'WMN-TOP-002', 'Women''s Regular Ivory Knit Top', 1, 'Woman', 2, 2, 'assets/items/women-ivory-top.png'),
  (8, 'WMN-REG-BOT-003', 'Women''s Regular Beige Trousers', 2, 'Woman', 2, 11, 'assets/items/women-regular-beige-trousers.png'),
  (9, 'MEN-NEW-CAS-001', 'Men''s Relaxed Rust Graphic Tee', 1, 'Man', 3, 16, 'assets/items/men-relaxed-rust-graphic-tee.png'),
  (10, 'MEN-NEW-SMT-001', 'Men''s Regular Burgundy Knit Polo', 1, 'Man', 2, 12, 'assets/items/men-regular-burgundy-knit-polo.png'),
  (11, 'MEN-NEW-FRM-001', 'Men''s Slim Navy Formal Shirt', 1, 'Man', 1, 6, 'assets/items/men-slim-navy-formal-shirt.png'),
  (12, 'MEN-NEW-STR-001', 'Men''s Oversized Blue Graphic Tee', 1, 'Man', 4, 14, 'assets/items/men-oversized-blue-graphic-tee.png'),
  (13, 'MEN-NEW-MIN-001', 'Men''s Regular Olive Tank Top', 1, 'Man', 2, 9, 'assets/items/men-regular-olive-tank.png'),
  (14, 'WMN-NEW-CAS-001', 'Women''s Relaxed Yellow Tank Top', 1, 'Woman', 3, 15, 'assets/items/women-relaxed-yellow-tank.png'),
  (15, 'WMN-NEW-SMT-001', 'Women''s Regular Rust Wrap Blouse', 1, 'Woman', 2, 16, 'assets/items/women-regular-rust-wrap-blouse.png'),
  (16, 'WMN-NEW-FRM-001', 'Women''s Slim Burgundy Satin Blouse', 1, 'Woman', 1, 12, 'assets/items/women-slim-burgundy-satin-blouse.png'),
  (17, 'WMN-NEW-STR-001', 'Women''s Oversized Olive Graphic Tee', 1, 'Woman', 4, 9, 'assets/items/women-oversized-olive-graphic-tee.png'),
  (18, 'WMN-NEW-MIN-001', 'Women''s Slim Light Blue Tank Top', 1, 'Woman', 1, 8, 'assets/items/women-slim-light-blue-tank.png'),
  (19, 'MEN-NEW-CAS-002', 'Men''s Relaxed Light Blue Jorts', 2, 'Man', 3, 8, 'assets/items/men-relaxed-light-blue-jorts.png'),
  (20, 'MEN-NEW-SMT-002', 'Men''s Regular Beige Knit Polo', 1, 'Man', 2, 11, 'assets/items/men-regular-beige-knit-polo-v2.png'),
  (21, 'MEN-NEW-FRM-002', 'Men''s Slim Black Tuxedo Trousers', 2, 'Man', 1, 3, 'assets/items/men-slim-black-tuxedo-trousers-v2.png'),
  (22, 'MEN-NEW-STR-002', 'Men''s Oversized Black Jorts', 2, 'Man', 4, 3, 'assets/items/men-oversized-black-jorts.png'),
  (23, 'MEN-NEW-MIN-002', 'Men''s Slim White Ribbed Tank Top', 1, 'Man', 1, 2, 'assets/items/men-slim-white-ribbed-tank-v2.png'),
  (24, 'WMN-NEW-CAS-002', 'Women''s Relaxed Light Blue Jorts', 2, 'Woman', 3, 8, 'assets/items/women-relaxed-light-blue-jorts.png'),
  (25, 'WMN-NEW-SMT-002', 'Women''s Regular Brown Tailored Vest', 1, 'Woman', 2, 10, 'assets/items/women-regular-brown-tailored-vest.png'),
  (26, 'WMN-NEW-FRM-002', 'Women''s Slim Red Satin Maxi Skirt', 2, 'Woman', 1, 13, 'assets/items/women-slim-red-satin-maxi-skirt.png'),
  (27, 'WMN-NEW-STR-002', 'Women''s Oversized Black Cargo Jorts', 2, 'Woman', 4, 3, 'assets/items/women-oversized-black-cargo-jorts.png'),
  (28, 'WMN-NEW-MIN-002', 'Women''s Slim Beige Ribbed Tank Top', 1, 'Woman', 1, 11, 'assets/items/women-slim-beige-ribbed-tank-v2.png'),
  (29, 'MEN-ACC-NEW-001', 'Men''s Black Crossbody Sling Bag', 6, 'Man', NULL, 3, 'assets/items/men-black-crossbody-sling-bag.png'),
  (30, 'MEN-ACC-NEW-002', 'Men''s Olive Canvas Tote Bag', 6, 'Man', NULL, 9, 'assets/items/men-olive-canvas-tote-bag.png'),
  (31, 'MEN-ACC-NEW-003', 'Men''s Brown Leather Messenger Bag', 6, 'Man', NULL, 10, 'assets/items/men-brown-leather-messenger-bag.png'),
  (32, 'MEN-SHO-NEW-001', 'Men''s White Court Sneakers', 5, 'Man', NULL, 2, 'assets/items/men-white-court-sneakers.png'),
  (33, 'MEN-SHO-NEW-002', 'Men''s Brown Leather Derby Shoes', 5, 'Man', NULL, 10, 'assets/items/men-brown-leather-derby-shoes.png'),
  (34, 'MEN-SHO-NEW-003', 'Men''s Black Chunky Street Sneakers', 5, 'Man', NULL, 3, 'assets/items/men-black-chunky-street-sneakers.png'),
  (35, 'WMN-ACC-NEW-001', 'Women''s Beige Structured Tote Bag', 6, 'Woman', NULL, 11, 'assets/items/women-beige-structured-tote-bag.png'),
  (36, 'WMN-ACC-NEW-002', 'Women''s Burgundy Shoulder Sling Bag', 6, 'Woman', NULL, 12, 'assets/items/women-burgundy-shoulder-sling-bag.png'),
  (37, 'WMN-ACC-NEW-003', 'Women''s Black Mini Crossbody Bag', 6, 'Woman', NULL, 3, 'assets/items/women-black-mini-crossbody-bag.png'),
  (38, 'WMN-SHO-NEW-001', 'Women''s Beige Ballet Flats', 5, 'Woman', NULL, 11, 'assets/items/women-beige-ballet-flats.png'),
  (39, 'WMN-SHO-NEW-002', 'Women''s Black Heeled Pumps', 5, 'Woman', NULL, 3, 'assets/items/women-black-heeled-pumps.png'),
  (40, 'WMN-SHO-NEW-003', 'Women''s White Platform Sneakers', 5, 'Woman', NULL, 2, 'assets/items/women-white-platform-sneakers.png');

INSERT INTO `catalog_item_styles` (`item_id`, `style_id`) VALUES
  (1,1), (1,2), (1,4), (2,1), (2,4), (2,5),
  (3,2), (3,5), (4,2), (4,3), (4,5),
  (5,1), (5,5), (6,1), (6,2), (6,5),
  (7,1), (7,5), (8,1), (8,2), (8,5),
  (9,1), (10,2), (11,3), (12,4), (13,5),
  (14,1), (15,2), (16,3), (17,4), (18,5),
  (19,1), (20,2), (21,3), (22,4), (23,5),
  (24,1), (25,2), (26,3), (27,4), (28,5),
  (29,1), (29,4), (29,5),
  (30,1), (30,4), (30,5),
  (31,2), (31,3), (31,5),
  (32,1), (32,4), (32,5),
  (33,2), (33,3),
  (34,1), (34,4),
  (35,2), (35,3), (35,5),
  (36,1), (36,2), (36,3),
  (37,1), (37,4), (37,5),
  (38,2), (38,3), (38,5),
  (39,2), (39,3),
  (40,1), (40,4), (40,5);

INSERT INTO `catalog_item_occasions` (`item_id`, `occasion_id`) VALUES
  (9,1), (9,3),
  (10,2), (10,3), (10,5),
  (11,2), (11,4), (11,5),
  (12,1), (12,3), (12,5),
  (13,1), (13,2), (13,3),
  (14,1), (14,3),
  (15,2), (15,3), (15,5),
  (16,4), (16,5),
  (17,1), (17,3), (17,5),
  (18,1), (18,2), (18,3),
  (19,1), (19,3),
  (20,2), (20,3), (20,5),
  (21,2), (21,4), (21,5),
  (22,1), (22,3), (22,5),
  (23,1), (23,2), (23,3),
  (24,1), (24,3),
  (25,2), (25,3), (25,5),
  (26,4), (26,5),
  (27,1), (27,3), (27,5),
  (28,1), (28,2), (28,3);

INSERT INTO `catalog_item_sizes` (`item_id`, `size_id`)
SELECT i.item_id, s.size_id
FROM catalog_items i
JOIN sizes s ON s.code IN ('XS','S','M','L','XL','2XL')
WHERE i.item_id IN (1,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28);

INSERT INTO `catalog_item_sizes` (`item_id`, `size_id`)
SELECT 2, size_id FROM sizes WHERE code BETWEEN '36' AND '45';

INSERT INTO `catalog_item_sizes` (`item_id`, `size_id`) VALUES (3,7), (4,7);

INSERT INTO `catalog_item_sizes` (`item_id`, `size_id`) VALUES
  (29,7), (30,7), (31,7), (35,7), (36,7), (37,7);

INSERT INTO `catalog_item_sizes` (`item_id`, `size_id`)
SELECT i.item_id, s.size_id
FROM catalog_items i
JOIN sizes s ON CAST(s.code AS UNSIGNED) BETWEEN 38 AND 45
WHERE i.item_id IN (32,33,34);

INSERT INTO `catalog_item_sizes` (`item_id`, `size_id`)
SELECT i.item_id, s.size_id
FROM catalog_items i
JOIN sizes s ON CAST(s.code AS UNSIGNED) BETWEEN 35 AND 42
WHERE i.item_id IN (38,39,40);

INSERT INTO `outfits` (`outfit_id`, `slug`, `name`, `style_id`, `gender`, `fit_id`, `base_score`) VALUES
  (1, 'men-casual', 'Regular Easygoing Layers', 1, 'Man', 2, 94.00),
  (2, 'women-casual', 'Regular Soft Layers', 1, 'Woman', 2, 94.00);

INSERT INTO `outfit_items` (`outfit_id`, `item_id`, `display_order`) VALUES
  (1,1,1), (1,5,2), (1,6,3), (1,2,4),
  (2,7,1), (2,8,2), (2,1,3), (2,2,4);

CREATE OR REPLACE VIEW `v_outfit_colors` AS
SELECT oi.outfit_id, i.color_id, MIN(oi.display_order) AS display_order
FROM outfit_items oi
JOIN catalog_items i ON i.item_id = oi.item_id
GROUP BY oi.outfit_id, i.color_id;

CREATE OR REPLACE VIEW `v_catalog_items` AS
SELECT
  i.item_id, i.sku, i.name, c.name AS category, i.gender,
  COALESCE(f.name, 'All fits') AS fit, co.name AS color,
  (SELECT GROUP_CONCAT(s.name ORDER BY s.style_id SEPARATOR ', ')
   FROM catalog_item_styles cis JOIN styles s ON s.style_id = cis.style_id
   WHERE cis.item_id = i.item_id) AS styles,
  (SELECT GROUP_CONCAT(o.name ORDER BY o.occasion_id SEPARATOR ', ')
   FROM catalog_item_occasions cio JOIN occasions o ON o.occasion_id = cio.occasion_id
   WHERE cio.item_id = i.item_id) AS occasions,
  i.image_path, i.is_active, i.created_at, i.updated_at
FROM catalog_items i
JOIN categories c ON c.category_id = i.category_id
LEFT JOIN fits f ON f.fit_id = i.fit_id
JOIN colors co ON co.color_id = i.color_id;

CREATE OR REPLACE VIEW `v_user_generation_usage` AS
SELECT u.user_id, COUNT(r.request_id) AS generations_used
FROM users u
LEFT JOIN recommendation_requests r ON r.user_id = u.user_id
GROUP BY u.user_id;

