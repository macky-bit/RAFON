# Pormatch database

`pormatch.sql` contains the normalized MariaDB/MySQL presentation schema, reference values, subscription plans, catalog examples, outfit relationships, user recommendation history, saved outfits, and read-only views. The seeded expanded catalog includes men's and women's jorts, tank tops/sando, tote, sling, crossbody, and messenger bags, plus casual and formal shoes. The `catalog_item_occasions` bridge records which of the five activities each new garment supports. The `v_outfit_colors` view derives each outfit palette from its clothing items, so the same color assignments are not stored twice.

The recommendation engine runs entirely in the browser and does not call an external service. `recommendation_requests` and `recommendation_results` are available for future server-side history storage when those account features are connected to MySQL.

## Recommended setup

1. Start MySQL in XAMPP.
2. Copy `.env.example` to `.env` in the project root.
3. Run `npm run db:setup` from the project root.

The default connection is:

```text
Host: 127.0.0.1
Port: 3306
User: root
Password: blank
Database: pormatch
```

Change `.env` if your XAMPP configuration is different. The setup command resets the configured database, so do not point it at a database containing information you need to retain.

For an existing database, run `update-membership-prices.sql` against the selected Pormatch database to change Premium to ₱79 monthly and ₱699 annually without resetting other data. Style Packs (₱29 per pack) and advertisements or featured promotions (negotiated rate) are proposed revenue sources, not membership plans in this schema.
