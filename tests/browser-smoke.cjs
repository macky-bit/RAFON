const { chromium } = require("playwright");
const assert = require("node:assert/strict");

const base = "http://127.0.0.1:4173/";
const errors = [];
const checks = [];
const check = (name, condition) => {
  assert.ok(condition, name);
  checks.push(name);
};

async function assertResponsive(browser, width, height, route, label) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(`${label}: ${error.message}`));
  await page.goto(`${base}#${route}`);
  await page.locator("#app").waitFor({ state: "visible" });
  check(`${label} has no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  check(`${label} renders readable content`, await page.locator("h1").first().isVisible());
  await context.close();
}

async function assertAuthenticatedMobile(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(`Mobile results: ${error.message}`));
  await page.goto(`${base}#login`);
  check("Login has no nonfunctional password recovery", await page.locator('a[href="#forgot-password"], [data-navigate="forgot-password"]').count() === 0);
  await page.locator("#demo-login").click();
  await page.waitForURL(/#generate$/);
  check("Authenticated header has no notification bell", await page.locator(".notification-button").count() === 0);
  check("Authenticated header has one plan entry", await page.locator('.nav-account [data-navigate="pricing"]').count() === 1);
  check("Generate page has no duplicated results preview", await page.locator(".results-grid").count() === 0);
  await page.locator("#generator-form").evaluate(form => form.requestSubmit());
  await page.waitForURL(/#results$/, { timeout: 15000 });
  check("Mobile results show three outfits", await page.locator(".results-page .outfit-card").count() === 3);
  check("Mobile results have no horizontal overflow", await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  await page.goto(`${base}#admin`);
  check("Mobile admin has no page-level horizontal overflow", await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  await context.close();
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
  page.on("console", message => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });

  await page.goto(`${base}#home`);
  check("Landing page loads", (await page.locator("h1").first().textContent()).includes("Find your perfect"));
  await page.locator(".landing-pricing").click();
  await page.waitForURL(/#pricing$/);
  await page.locator(".pricing-grid").waitFor({ state: "visible" });
  check("Pricing opens with one click", true);
  check("Monthly Premium shows the proposed price", (await page.locator(".price-card.featured").textContent()).includes("₱79") && (await page.locator(".price-card.featured").textContent()).includes("/month"));
  await page.locator('[data-billing="annual"]').click();
  check("Annual Premium shows the proposed price", (await page.locator(".price-card.featured").textContent()).includes("₱699") && (await page.locator(".price-card.featured").textContent()).includes("/year"));
  check("Other proposed revenue sources appear once", await page.locator(".pricing-extra").count() === 2 && (await page.locator(".pricing-extras").textContent()).includes("₱29") && (await page.locator(".pricing-extras").textContent()).includes("Negotiated rate"));
  check("Style Packs are separate from both memberships", (await page.locator(".pricing-extra").first().textContent()).includes("both Free and Premium members") && (await page.locator(".pricing-extra").first().textContent()).includes("separate purchase"));
  check("Partner proposals require review", (await page.locator(".pricing-extra").last().textContent()).includes("reviewed"));
  const partnershipLink = await page.getByRole("link", { name: "Email Pormatch" }).getAttribute("href");
  check("Partner inquiry opens a prepared email", partnershipLink?.startsWith("mailto:pormatch@gmail.com?subject=") && decodeURIComponent(partnershipLink).includes("Campaign idea:"));

  await page.goto(`${base}#login`);
  await page.locator("#demo-login").click();
  await page.waitForURL(/#generate$/);
  const occasionOptions = await page.locator('select[name="occasion"] option').allTextContents();
  check("Generator has the five requested activities", occasionOptions.length === 5 && !occasionOptions.includes("Casual outing"));
  check("Generator has five preferred styles", await page.locator('select[name="style"] option').count() === 5);
  check("Generator has all fifteen main colors", await page.locator('select[name="color"] option').count() === 15);
  await page.locator('select[name="occasion"]').selectOption({ label: "Special occasion" });
  await page.locator('select[name="style"]').selectOption({ label: "Smart Casual" });
  await page.locator('select[name="color"]').selectOption({ label: "Rust" });
  await page.locator("#generator-form").evaluate(form => form.requestSubmit());
  await page.waitForURL(/#results$/, { timeout: 15000 });
  check("Generator returns exactly three outfits", await page.locator(".results-page .outfit-card").count() === 3);
  check("Results have no Like, Dislike, or Compare controls", await page.locator('[data-feedback], input[name="compare"], .compare-dock').count() === 0);
  check("Each result keeps only Save and View Details", await page.locator(".results-page .outfit-actions").evaluateAll(rows => rows.every(row => row.querySelectorAll("button").length === 2)));
  check("Rust selection returns exact-color garments", await page.locator(".color-result.exact").count() === 3);
  check("New women's Rust blouse appears in results", await page.locator('img[src*="women-regular-rust-wrap-blouse"]').count() >= 1);
  check("Offline preference matching is shown", (await page.locator(".match-engine").textContent()).includes("Matched to your preferences"));
  const firstResultQuality = await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("pormatch-mvp"));
    return saved.results.map(outfit => ({
      score: outfit.score,
      explanation: outfit.explanation,
      core: outfit.items.filter(item => ["Top", "Bottom", "Dress"].includes(item.category)).map(item => item.id).sort().join("|")
    }));
  });
  check("Every result includes a transparent five-part score", firstResultQuality.every(result => /activity \d+\/30, style \d+\/25, color \d+\/20, fit \d+\/15, completeness \d+\/10/.test(result.explanation)));
  check("The three results use distinct core clothing combinations", new Set(firstResultQuality.map(result => result.core)).size === 3);
  check("Match scores stay within the expected range", firstResultQuality.every(result => Number.isInteger(result.score) && result.score >= 0 && result.score <= 99));
  const firstGeneration = await page.locator(".results-page .outfit-card").evaluateAll(cards => cards.map(card => [...card.querySelectorAll("img")].map(image => image.getAttribute("src")).join("|")).join("||"));
  await page.locator("#generate-again").click();
  await page.waitForFunction(previous => [...document.querySelectorAll(".results-page .outfit-card")].map(card => [...card.querySelectorAll("img")].map(image => image.getAttribute("src")).join("|")).join("||") !== previous, firstGeneration);
  const secondGeneration = await page.locator(".results-page .outfit-card").evaluateAll(cards => cards.map(card => [...card.querySelectorAll("img")].map(image => image.getAttribute("src")).join("|")).join("||"));
  check("Generating twice with the same choices returns a different set", secondGeneration !== firstGeneration);
  await page.locator("[data-save]").first().click();
  await page.goto(`${base}#saved`);
  check("Saved outfit appears", await page.locator(".saved-grid .outfit-card").count() >= 1);
  check("Saved outfits have no unnecessary filters", await page.locator(".filter-bar").count() === 0);

  await page.goto(`${base}#dashboard`);
  check("Dashboard has one main generator action", await page.locator('.home-hero [data-navigate="generate"]').count() === 1);
  check("Dashboard has no duplicated style-card actions", await page.locator(".featured-grid").count() === 0);

  await page.goto(`${base}#profile`);
  check("Profile page has no duplicate logout or notification preference", await page.locator('.settings-layout [data-logout], input[name="notifications"]').count() === 0);

  await page.goto(`${base}#pricing`);
  check("Style Packs appear once", await page.getByRole("heading", { name: "Style Packs" }).count() === 1);
  await page.locator('[data-activate-plan="premium"]').click();
  check("Activation review uses the annual price", (await page.locator("#activation-review").textContent()).includes("₱699/year"));
  await page.locator('#activation-review button[type="submit"]').click();
  check("Active membership names its billing cycle", (await page.locator(".current-plan").textContent()).includes("Annual Premium is active"));
  await page.locator('[data-billing="monthly"]').click();
  check("Active member can switch billing cycles", await page.locator('[data-activate-plan="premium"]').isVisible());

  await page.goto(`${base}#admin`);
  check("Admin exposes only the three useful sections", await page.locator(".admin-tabs [data-admin-tab]").count() === 3);
  check("Admin has no Outfits, Feedback, or Settings sections", await page.locator('[data-admin-tab="outfits"], [data-admin-tab="feedback"], [data-admin-tab="settings"]').count() === 0);
  for (const [tab, marker] of [["overview", ".stats-grid"], ["clothing", ".admin-grid"], ["users", "table"]]) {
    await page.locator(`[data-admin-tab="${tab}"]`).first().click();
    check(`Admin ${tab} works`, await page.locator(marker).first().isVisible());
  }
  await page.locator('[data-admin-tab="clothing"]').first().click();
  check("Admin catalog contains eighty-two clothing assets", await page.locator("[data-admin-row]").count() === 82);
  check("New graphic tees and tank tops are in the catalog", await page.getByText("Men's Relaxed Rust Graphic Tee", { exact: true }).count() === 1 && await page.getByText("Women's Slim Beige Ribbed Tank Top", { exact: true }).count() === 1);
  check("Men's and women's jorts are in the catalog", await page.getByText("Men's Relaxed Light Blue Jorts", { exact: true }).count() === 1 && await page.getByText("Women's Oversized Black Cargo Jorts", { exact: true }).count() === 1);
  check("Men's and women's bags are in the catalog", await page.getByText("Men's Black Crossbody Sling Bag", { exact: true }).count() === 1 && await page.getByText("Women's Beige Structured Tote Bag", { exact: true }).count() === 1);
  check("Men's and women's shoes are in the catalog", await page.getByText("Men's Brown Leather Derby Shoes", { exact: true }).count() === 1 && await page.getByText("Women's Beige Ballet Flats", { exact: true }).count() === 1);

  await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("pormatch-mvp"));
    saved.profile.gender = "Woman";
    saved.profile.fit = "Relaxed";
    saved.selection = { occasion: "School", style: "Casual", color: "Light blue" };
    saved.results = [];
    localStorage.setItem("pormatch-mvp", JSON.stringify(saved));
  });
  await page.reload();
  await page.goto(`${base}#generate`);
  await page.locator("#generator-form").evaluate(form => form.requestSubmit());
  await page.waitForURL(/#results$/, { timeout: 15000 });
  check("Women's relaxed jorts participate in generation", await page.locator('img[src*="women-relaxed-light-blue-jorts"]').count() >= 1);

  await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("pormatch-mvp"));
    saved.profile.gender = "Man";
    saved.profile.fit = "Oversized";
    saved.selection = { occasion: "School", style: "Streetwear", color: "Black" };
    saved.results = [];
    localStorage.setItem("pormatch-mvp", JSON.stringify(saved));
  });
  await page.reload();
  await page.goto(`${base}#generate`);
  await page.locator("#generator-form").evaluate(form => form.requestSubmit());
  await page.waitForURL(/#results$/, { timeout: 15000 });
  check("Men's oversized jorts participate in generation", await page.locator('img[src*="men-oversized-black-jorts"]').count() >= 1);
  check("Men's new bags participate in generation", await page.locator('img[src*="men-black-crossbody-sling-bag"]').count() >= 1);
  check("Men's new shoes participate in generation", await page.locator('img[src*="men-white-court-sneakers"], img[src*="men-black-chunky-street-sneakers"]').count() >= 1);

  await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("pormatch-mvp"));
    saved.profile.gender = "Woman";
    saved.profile.fit = "Regular";
    saved.selection = { occasion: "Work", style: "Smart Casual", color: "Beige" };
    saved.results = [];
    localStorage.setItem("pormatch-mvp", JSON.stringify(saved));
  });
  await page.reload();
  await page.goto(`${base}#generate`);
  await page.locator("#generator-form").evaluate(form => form.requestSubmit());
  await page.waitForURL(/#results$/, { timeout: 15000 });
  check("Women's new bags participate in generation", await page.locator('img[src*="women-beige-structured-tote-bag"]').count() >= 1);
  check("Women's new shoes participate in generation", await page.locator('img[src*="women-beige-ballet-flats"]').count() >= 1);

  await context.close();
  await assertResponsive(browser, 1440, 900, "home", "Desktop landing");
  await assertResponsive(browser, 1024, 768, "pricing", "Tablet pricing");
  await assertResponsive(browser, 768, 1024, "login", "Small tablet login");
  await assertResponsive(browser, 390, 844, "home", "Mobile landing");
  await assertResponsive(browser, 360, 800, "privacy", "Small mobile legal page");
  await assertAuthenticatedMobile(browser);
  await browser.close();

  if (errors.length) throw new Error(errors.join("\n"));
  console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
