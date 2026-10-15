# Pormatch Final Presentation

Pormatch is a responsive outfit-recommendation system built with HTML, CSS, vanilla JavaScript, Node.js, Express, and XAMPP MariaDB/MySQL.

The application uses a deterministic offline recommendation engine. It does not require an external API, an API key, or an internet connection. Clothing images and the complete demonstration catalog are stored locally.

## What is included

- Public landing, pricing, login, signup, privacy, terms, 404, and error pages
- Authenticated outfit generator, results, saved outfits, history, profile, plans, and focused administrator screens
- Gender/catalog, size, preferred-fit, activity, style, and color matching
- 82 local catalog images, including men's and women's jorts, graphic tees, tank tops/sando, bags, totes, sling bags, sneakers, flats, dress shoes, formalwear, and blouses
- Five activities: School, Work, Date, Gala, and Special occasion
- Five preferred styles and all 15 selectable main colors
- Exactly three distinct outfit results
- Complete normalized MySQL/MariaDB schema
- Responsive layouts for desktop, tablet, and mobile sizes
- Automated project checks and browser smoke tests

## Improved offline generator

Pormatch builds complete outfits from active catalog items, rejects weak combinations, and scores the remaining choices with these weights:

- Activity suitability: 30%
- Preferred style: 25%
- Main-color match and color harmony: 20%
- Preferred-fit compatibility: 15%
- Outfit completeness and supporting pieces: 10%

The generator can use a compatible neighboring fit when the exact preferred fit has limited inventory. It supports top-and-bottom outfits and dresses, chooses suitable shoes and accessories, prevents duplicate core combinations in the same result set, and avoids the previous three combinations when alternatives remain.

## Requirements

- Node.js 20 or newer
- XAMPP with MySQL/MariaDB
- No internet connection or external API key is required

## First-time setup

1. Start **MySQL** in the XAMPP Control Panel.
2. Open a terminal in this project folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Keep the XAMPP defaults in `.env`, or update them to match your installation.
6. Run `npm run db:setup` once to create and seed the database.
7. Run `npm start`.
8. Open `http://127.0.0.1:4173`.

`npm run db:setup` rebuilds the database named by `DB_NAME`. Use it for initial presentation setup, not against a database containing information you need to preserve.

## Demonstration account

- Email: `demo@pormatch.local`
- Password: `demo1234`

The demonstration account is intentionally local to the presentation interface. It must be replaced with server-side authentication and hashed passwords before any public deployment.

## Useful commands

- `npm start` — start Pormatch
- `npm run dev` — start with automatic server restart
- `npm run db:setup` — initialize the configured presentation database
- `npm run check` — check JavaScript syntax
- `npm test` — run the automated project tests
- `node tests/browser-smoke.cjs` — run the complete browser test while Pormatch is running

## Presentation reliability

Start XAMPP MySQL and the Node server before the demonstration. The recommendation engine itself is fully offline, so it continues working without Wi-Fi.

## Expanded catalog

The expanded database catalog contains balanced men's and women's additions across all five preferred styles. It includes jorts, tank tops/sando, graphic tees, polos, shirts, blouses, gender-specific tote, sling, crossbody, and messenger bags, plus casual, streetwear, smart-casual, and formal shoes. New garments have explicit activity mappings, while bags and shoes are matched using style, main-color harmony, and gender.
