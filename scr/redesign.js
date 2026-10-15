
state.profile = {
  favoriteStyles: [], favoriteColors: [], avoidColors: [],
  ...state.profile
};
const MEMBERSHIP_CONFIG = Object.freeze({
  currency: "PHP",
  free: Object.freeze({ name: "Free", generationLimit: 5, savedLimit: 6, historyLimit: 3 }),
  premium: Object.freeze({ name: "Premium", monthlyPrice: 79, annualPrice: 699 }),
  stylePack: Object.freeze({ price: 29 }),
  promotionCooldownMs: 24 * 60 * 60 * 1000
});
const PARTNERSHIP_EMAIL = "pormatch@gmail.com";
state.memberships = state.memberships && typeof state.memberships === "object" ? state.memberships : {};
state.promotionDismissals = state.promotionDismissals && typeof state.promotionDismissals === "object" ? state.promotionDismissals : {};
state.pricingCycle = state.pricingCycle === "annual" ? "annual" : "monthly";
saveState();
let adminSection = "overview";

function membershipKey() {
  return state.currentUser ? String(state.currentUser.id || state.currentUser.email) : "guest";
}

function membership() {
  const key = membershipKey();
  if (!state.memberships[key]) {
    state.memberships[key] = {
      plan: "free",
      billingCycle: null,
      generationsUsed: state.currentUser?.id === 1 ? Math.min(state.generations || 0, MEMBERSHIP_CONFIG.free.generationLimit) : 0
    };
    saveState();
  }
  const current = state.memberships[key];
  current.generationsUsed = Number.isFinite(current.generationsUsed) ? current.generationsUsed : 0;
  return current;
}

function hasPremium() {
  return Boolean(state.currentUser) && membership().plan === "premium";
}

function routeName() {
  const raw = (location.hash.replace("#", "") || "home").split("?")[0].toLowerCase();
  return ({ create: "generate", generator: "generate" })[raw] || raw;
}

function navigate(route, { replace = false } = {}) {
  const nextHash = `#${route}`;
  if (location.hash === nextHash) {
    render();
    return;
  }
  if (replace) {
    history.replaceState(null, "", nextHash);
    render();
    return;
  }
  location.hash = route;
}

function toast(message) {
  const element = $("#toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove("show"), 2600);
}

function brandLogo(link = "home", compact = false) {
  return `<a class="brand-logo ${compact ? "compact" : ""}" href="#${link}" aria-label="Pormatch home"><img src="assets/Pormatch_Logo_Transparent.png" alt="Pormatch"></a>`;
}

function navigation(routeOverride = routeName()) {
  const route = routeOverride;
  const header = $("#site-header");
  const mobile = $("#mobile-nav");
  const publicRoute = route === "home" || (["login", "signup", "privacy", "terms", "error", "not-found", "pricing"].includes(route) && !state.currentUser);
  if (publicRoute || route === "onboarding") {
    header.innerHTML = "";
    mobile.innerHTML = "";
    return;
  }
  const active = name => route === name || (name === "generate" && route === "results");
  const firstName = escapeHTML((state.profile.name || "Friend").split(" ")[0]);
  header.innerHTML = `<div class="nav-shell">
    ${brandLogo("dashboard", true)}
    <nav class="desktop-nav" aria-label="Primary navigation">
      <a class="${active("dashboard") ? "active" : ""}" href="#dashboard">Home</a>
      <a class="${active("generate") ? "active" : ""}" href="#generate">Generate Outfit</a>
      <a class="${active("saved") ? "active" : ""}" href="#saved">Saved</a>
      <a class="${active("history") ? "active" : ""}" href="#history">History</a>
      ${state.currentUser?.role === "admin" ? `<a class="${active("admin") ? "active" : ""}" href="#admin">Administrator</a>` : ""}
    </nav>
    <div class="nav-account"><button class="${hasPremium() ? "premium-badge" : "upgrade-button"}" type="button" data-navigate="pricing" aria-label="${hasPremium() ? "Manage Premium plan" : "View plans and upgrade"}">${hasPremium() ? "Premium" : "Upgrade"}</button><details class="profile-menu"><summary class="account-button" aria-label="Open profile menu"><span class="avatar">${initials(state.profile.name)}</span><span>Hello, ${firstName}</span>${icon("chevron")}</summary><div class="profile-popover"><a href="#profile">Profile & Preferences</a><button type="button" data-logout>Log out</button></div></details></div>
  </div>`;
  mobile.innerHTML = `<a class="${active("dashboard") ? "active" : ""}" href="#dashboard">${icon("home")}<span>Home</span></a><a class="${active("generate") ? "active" : ""}" href="#generate">${icon("create")}<span>Generate</span></a><a class="${active("saved") ? "active" : ""}" href="#saved">${icon("saved")}<span>Saved</span></a><details class="mobile-more"><summary>${icon("more")}<span>More</span></summary><div><a href="#history">History</a><a href="#profile">Profile</a><a href="#pricing">${hasPremium() ? "Manage plan" : "Upgrade"}</a>${state.currentUser?.role === "admin" ? '<a href="#admin">Admin</a>' : ""}<button type="button" data-logout>Log out</button></div></details>`;
}

ICONS.home = '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>';
ICONS.more = '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>';
ICONS.close = '<path d="m6 6 12 12M18 6 6 18"/>';

function workspaceTopbar() { return ""; }

function flatLay(items, label = "Coordinated outfit") {
  return `<div class="flat-lay" role="group" aria-label="${escapeHTML(label)}">${items.map((item, index) => `<img class="flat-piece flat-piece-${index + 1}" src="${item.image}" alt="${escapeHTML(item.name)}">`).join("")}</div>`;
}

function paletteDots(colors) {
  return `<div class="palette" aria-label="Color palette">${colors.slice(0, 4).map(color => `<i style="--dot:${color}"></i>`).join("")}</div>`;
}

function landingLook(outfit, index, score) {
  return `<article class="landing-look look-${index}"><header><strong>Look 0${index}</strong><span class="landing-score">${score}%</span></header>${flatLay(outfit.items, `${outfit.name}, Look 0${index}`)}${paletteDots([...outfit.colors, "#eee9df"])}</article>`;
}

function homeView() {
  const looks = [
    OUTFITS.find(item => item.id === "women-casual") || OUTFITS[0],
    OUTFITS.find(item => item.id === "men-slim-tailored") || OUTFITS[1],
    OUTFITS.find(item => item.id === "women-oversized-minimal") || OUTFITS[2]
  ];
  return `<section class="landing-page">
    <header class="landing-header">${brandLogo("home")}<button class="landing-pricing" type="button" data-navigate="pricing" aria-label="View Pormatch pricing">Pricing</button></header>
    <div class="landing-hero">
      <div class="landing-copy">
        <p class="eyebrow">Your style, more possibilities</p>
        <h1>Find your perfect<br>match.</h1>
        <p class="lede">Tell us where you’re going, the style you want, and your main color. Pormatch selects three coordinated outfits from a curated collection.</p>
        <div class="button-row">${state.currentUser ? '<button class="primary-button" type="button" data-navigate="dashboard">Open your dashboard <span aria-hidden="true">→</span></button>' : '<button class="primary-button" type="button" data-navigate="signup">Create an account <span aria-hidden="true">→</span></button><button class="secondary-button" type="button" data-navigate="login">Log in</button>'}</div>
        <div class="landing-benefits"><span>3 tailored looks</span><span>Matched to your profile</span><span>Ready in moments</span></div>
      </div>
      <div class="landing-visual" aria-label="Three Pormatch outfit recommendations">
        <span class="decor-arc arc-one"></span><span class="decor-arc arc-two"></span>
        ${landingLook(looks[0], 2, 88)}${landingLook(looks[1], 1, 96)}${landingLook(looks[2], 3, 90)}
      </div>
    </div>
    ${publicFooter()}
  </section>`;
}

function publicFooter() {
  return `<footer class="public-footer"><span>© 2026 Pormatch</span><nav aria-label="Legal information"><a href="#privacy">Privacy</a><a href="#terms">Terms</a></nav></footer>`;
}

function authAside() {
  const outfit = OUTFITS.find(item => item.id === "women-smart") || OUTFITS[0];
  return `<aside class="auth-aside"><div><p class="eyebrow">Style, simplified</p><h2>Three thoughtful looks.<br>One confident choice.</h2><p>Recommendations shaped around your plans, preferred fit, and personal palette.</p></div>${flatLay(outfit.items, outfit.name)}</aside>`;
}

function loginView() {
  return `<section class="auth-page">${authAside()}<div class="auth-panel"><div class="auth-panel-inner">${brandLogo("home", true)}<p class="eyebrow">Welcome back</p><h1>Log in to Pormatch</h1><p class="muted">Your next outfit is only a few choices away.</p><form id="login-form"><div class="field"><label for="login-email">Email address</label><input id="login-email" type="email" name="email" autocomplete="email" required></div><div class="field password-field"><label for="login-password">Password</label><input id="login-password" type="password" name="password" autocomplete="current-password" minlength="8" required><button class="password-toggle" type="button" data-password-toggle="login-password" aria-pressed="false" aria-label="Show password">Show</button></div><button class="primary-button" type="submit">Log in</button></form><div class="demo-box"><p><strong>Explore the full experience</strong><br><span>Open the prepared account, including administrator tools.</span></p><button class="secondary-button" type="button" id="demo-login">Use demo account</button></div><p class="auth-switch">New to Pormatch? <button class="text-link" type="button" data-navigate="signup">Create an account</button></p><div class="auth-legal-links"><a href="#privacy">Privacy</a><a href="#terms">Terms</a></div></div></div></section>`;
}

function signupView() {
  return `<section class="auth-page">${authAside()}<div class="auth-panel"><div class="auth-panel-inner">${brandLogo("home", true)}<p class="eyebrow">Create your profile</p><h1>Let’s find your fit.</h1><p class="muted">Tell us the essentials. You can refine your preferences later.</p><form id="signup-form"><div class="field"><label for="signup-name">Full name</label><input id="signup-name" name="name" autocomplete="name" required></div><div class="field"><label for="signup-email">Email address</label><input id="signup-email" type="email" name="email" autocomplete="email" required></div><div class="field"><label for="signup-gender">Gender</label><select id="signup-gender" name="gender" required><option value="" selected disabled hidden>Select your gender</option>${GENDERS.map(gender => `<option value="${gender}">${gender}</option>`).join("")}</select></div><div class="form-grid"><div class="field password-field"><label for="signup-password">Password</label><input id="signup-password" type="password" name="password" autocomplete="new-password" minlength="8" required><button class="password-toggle" type="button" data-password-targets="signup-password signup-confirm" aria-pressed="false" aria-label="Show password and confirm password">Show</button></div><div class="field"><label for="signup-confirm">Confirm password</label><input id="signup-confirm" type="password" name="confirmation" autocomplete="new-password" minlength="8" required></div></div><label class="check-row"><input type="checkbox" name="terms" required><span>I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.</span></label><button class="primary-button" type="submit">Continue</button></form><p class="auth-switch">Already registered? <button class="text-link" type="button" data-navigate="login">Log in</button></p></div></div></section>`;
}

function supportShell({ eyebrow, title, copy, content, footer = true }) {
  const header = state.currentUser ? "" : `<header class="support-header">${brandLogo("home", true)}<a class="secondary-button compact-button" href="#home">Back to landing</a></header>`;
  return `<section class="support-page">${header}<main class="support-card"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="lede">${copy}</p>${content}</main>${footer ? publicFooter() : ""}</section>`;
}

function privacyView() {
  return supportShell({ eyebrow: "Legal", title: "Privacy Policy", copy: "How Pormatch handles account, preference, and recommendation information.", content: `<article class="legal-copy"><p><strong>Effective date:</strong> October 10, 2026</p><h2>Information we use</h2><p>Pormatch uses account details, clothing size, preferred fit, style and color preferences, saved outfits, and recommendation history to provide personalized outfit suggestions.</p><h2>How information is used</h2><p>Information is used to operate accounts, generate recommendations, remember saved looks, protect the service, and manage plan access.</p><h2>Storage and security</h2><p>The current build is a prototype that stores demonstration data in the browser. A public release must store account information on a secured backend, hash passwords, restrict staff access, use HTTPS, and maintain backups.</p><h2>Sharing and retention</h2><p>Pormatch should share only the minimum information required by hosting, analytics, or payment service providers. Production retention periods and deletion procedures must be documented before accepting public accounts.</p><h2>Your choices</h2><p>Users should be able to update their profile and request account or data deletion.</p><p class="legal-notice">This starter policy must be reviewed and completed for the laws and service providers that apply to the final deployment.</p></article>` });
}

function termsView() {
  return supportShell({ eyebrow: "Legal", title: "Terms of Service", copy: "The basic rules for using Pormatch responsibly.", content: `<article class="legal-copy"><p><strong>Effective date:</strong> October 10, 2026</p><h2>Using Pormatch</h2><p>Users must provide accurate account information, protect their login credentials, and use the service lawfully. Outfit recommendations are style suggestions, not professional, safety, medical, or financial advice.</p><h2>Accounts and access</h2><p>Pormatch may restrict accounts that misuse the service, attempt unauthorized access, interfere with other users, or violate applicable laws.</p><h2>Plans</h2><p>The current subscription interface is a demonstration and does not process real payments. Before paid launch, billing frequency, renewal, cancellation, refunds, taxes, and payment-provider terms must be disclosed clearly.</p><h2>Content and availability</h2><p>Catalog images and brand assets must be owned or properly licensed. Features and outfit availability may change as the catalog evolves.</p><h2>Limitations</h2><p>The prototype is provided for evaluation. Production warranty, liability, dispute, governing-law, and termination language must be reviewed before launch.</p><p class="legal-notice">These starter terms are not a substitute for legal review before publishing a commercial service.</p></article>` });
}

function notFoundView() {
  return supportShell({ eyebrow: "404", title: "That page is not here.", copy: "The address may be outdated, incomplete, or moved.", content: `<div class="error-actions"><a class="primary-button" href="${state.currentUser ? "#dashboard" : "#home"}">Go to Home</a></div>` });
}

function errorView() {
  return supportShell({ eyebrow: "Something went wrong", title: "We couldn’t load that page.", copy: "Your information has not been changed. Try again or return to Home.", content: `<div class="error-actions"><button class="primary-button" type="button" id="retry-page">Try again</button><a class="secondary-button" href="${state.currentUser ? "#dashboard" : "#home"}">Return Home</a></div>` });
}

function onboardingView() {
  return `<section class="onboarding-page"><div class="onboarding-card">${brandLogo("home", true)}<p class="eyebrow">One quick step</p><h1>How do you like your clothes to fit?</h1><p class="lede">We’ll use these defaults whenever we assemble your recommendations.</p><form id="onboarding-form"><div class="form-grid"><div class="field"><label for="onboarding-size">Clothing size</label><select id="onboarding-size" name="size" required>${SIZES.map(size => `<option ${state.profile.size === size ? "selected" : ""}>${size}</option>`).join("")}</select></div><div class="field"><label for="onboarding-fit">Preferred fit</label><select id="onboarding-fit" name="fit" required>${FITS.map(fit => `<option ${state.profile.fit === fit ? "selected" : ""}>${fit}</option>`).join("")}</select></div></div><button class="primary-button" type="submit">Save and start styling</button></form></div></section>`;
}

function dashboardView() {
  const profileOutfits = OUTFITS.filter(item => state.profile.gender === "Prefer not to say" || item.gender === state.profile.gender);
  const byStyle = style => profileOutfits.find(item => item.style === style && item.fit === state.profile.fit) || profileOutfits.find(item => item.style === style) || OUTFITS.find(item => item.style === style) || OUTFITS[0];
  const hero = byStyle("Casual");
  return `<section class="home-page">
    <article class="home-hero"><div class="home-hero-copy"><p class="eyebrow">Your style, more possibilities</p><h1>Find your <span>perfect match.</span></h1><p class="lede">Personalized outfits for every activity — from work and weekends to travel and everything in between.</p><div class="home-hero-actions"><button class="primary-button" type="button" data-navigate="generate">✦ Generate an Outfit</button><span class="hero-assurance">Three personalized looks in moments</span></div></div><div class="home-hero-art"><span class="shape shape-a"></span><span class="shape shape-b"></span><span class="shape shape-c"></span>${flatLay(hero.items, "Featured coordinated outfit")}</div></article>
  </section>`;
}

function generatorForm() {
  const selected = state.selection;
  return `<section class="generator-panel"><div class="generator-heading"><div><p class="eyebrow">Build your edit</p><h1>What are you dressing for?</h1></div><button class="profile-summary" type="button" data-navigate="profile"><span class="avatar">${initials(state.profile.name)}</span><span><small>Your style profile</small><strong>${escapeHTML(state.profile.size)} · ${escapeHTML(state.profile.fit)} fit · ${escapeHTML(state.profile.gender)}</strong></span>${icon("chevron")}</button></div><form id="generator-form"><label class="select-card"><span><small>Activity or destination</small><select name="occasion">${OCCASIONS.map(value => `<option ${selected.occasion === value ? "selected" : ""}>${value}</option>`).join("")}</select></span></label><label class="select-card"><span><small>Preferred style</small><select name="style">${STYLES.map(value => `<option ${selected.style === value ? "selected" : ""}>${value}</option>`).join("")}</select></span></label><label class="select-card"><span><small>Main color</small><select name="color">${Object.keys(PALETTE).map(value => `<option ${selected.color === value ? "selected" : ""}>${value}</option>`).join("")}</select></span></label><button class="primary-button generate-button" type="submit">✦ Generate Outfits</button></form><div class="color-helper"><i style="--dot:${PALETTE[selected.color]?.hex}"></i><span><strong>${escapeHTML(selected.color)}</strong> pairs beautifully with ${PALETTE[selected.color]?.matches.join(", ")}.</span></div></section>`;
}

function generateView() {
  return `<section class="page-intro"><div><p class="eyebrow">Personal styling</p><h1>Generate an outfit</h1><p class="lede">Choose three details. We’ll rank exactly three complete looks around your profile.</p></div></section>${generatorForm()}`;
}

function loadingView() {
  return `<section class="loading-state"><div><div class="spinner" aria-hidden="true"></div><h2>Matching your wardrobe</h2><p class="muted">Checking activity, style, color, size and fit…</p></div></section>`;
}

function outfitCard(outfit, saved = false) {
  const isSaved = state.saved.some(item => item.id === outfit.id);
  const score = outfit.score || outfit.baseScore;
  return `<article class="outfit-card"><div class="outfit-visual"><span class="rank-badge">${saved ? "Saved look" : `Look 0${outfit.rank || 1}`}</span>${!saved ? `<span class="score-ring" style="--score:${score}%"><strong>${score}%</strong></span>` : ""}${flatLay(outfit.items, `${outfit.name} clothing pieces`)}</div><div class="outfit-card-body"><header><div><p class="eyebrow">${escapeHTML(outfit.style)}</p><h2>${escapeHTML(outfit.name)}</h2></div>${paletteDots(outfit.colors)}</header><div class="outfit-facts"><span>${escapeHTML(state.selection.occasion || "Everyday")}</span><span>${escapeHTML(outfit.fit)} fit</span><span>${escapeHTML(state.profile.size)}</span></div>${outfit.colorMatchLabel ? `<p class="color-result ${outfit.exactColorMatch ? "exact" : "alternative"}">${outfit.exactColorMatch ? "✓" : "~"} ${escapeHTML(outfit.colorMatchLabel)}</p>` : ""}<p class="outfit-explanation">${escapeHTML(outfit.explanation || "A coordinated Pormatch look chosen for your activity, style and preferred fit.")}</p><div class="card-actions">${saved ? `<button type="button" data-details="${outfit.id}">View details</button><button class="danger-action" type="button" data-remove="${outfit.id}">Remove</button>` : `<button type="button" data-save="${outfit.id}" class="${isSaved ? "active" : ""}">${isSaved ? "✓ Saved" : "♡ Save"}</button><button type="button" data-details="${outfit.id}">View Details</button>`}</div></div></article>`;
}

function resultsView() {
  if (!state.results.length) return `<section class="empty-state"><div class="empty-icon">✦</div><h1>No recommendations yet</h1><p>Create your first outfit set using three quick choices.</p><button class="primary-button" type="button" data-navigate="generate">Open generator</button></section>`;
  const { occasion, style, color } = state.selection;
  return `<section class="page-intro results-intro"><div><p class="eyebrow">Three curated matches</p><h1>Your outfits are ready.</h1><div class="summary-pills"><span>${escapeHTML(occasion)}</span><span>${escapeHTML(style)}</span><span><i style="--dot:${PALETTE[color]?.hex}"></i>${escapeHTML(color)}</span><span>${escapeHTML(state.profile.size)} · ${escapeHTML(state.profile.fit)}</span><span class="match-engine" title="Scored offline using activity, style, color harmony, fit and outfit completeness.">${icon("sparkles")} Matched to your preferences</span></div></div><div class="button-row"><button class="secondary-button" type="button" data-navigate="generate">Edit choices</button><button class="primary-button" type="button" id="generate-again">Generate again</button></div></section><section class="results-grid results-page" aria-label="Outfit recommendations">${state.results.map(outfit => outfitCard(outfit)).join("")}</section>`;
}

function savedView() {
  return `<section class="page-intro"><div><p class="eyebrow">Your wardrobe board</p><h1>Saved outfits</h1><p class="lede">${state.saved.length} ${state.saved.length === 1 ? "look" : "looks"} ready to revisit.</p></div><button class="primary-button" type="button" data-navigate="generate">Create another</button></section>${state.saved.length ? `<section class="saved-grid">${state.saved.map(outfit => outfitCard(outfit, true)).join("")}</section>` : `<section class="empty-state"><div class="empty-icon">♡</div><h1>Nothing saved yet</h1><p>Save any recommendation and it will appear here.</p><button class="primary-button" type="button" data-navigate="generate">Find an outfit</button></section>`}`;
}

function historyOutfits(entry) {
  if (Array.isArray(entry.outfits) && entry.outfits.length) return normalizeOutfits(entry.outfits, state.catalog);
  return (entry.outfitIds || []).map(id => OUTFITS.find(item => item.id === id)).filter(Boolean);
}

function historyView() {
  return `<section class="page-intro"><div><p class="eyebrow">Recommendation archive</p><h1>Your history</h1><p class="lede">Revisit the exact outfits from a previous styling brief.</p></div><button class="primary-button" type="button" data-navigate="generate">Create outfits</button></section>${state.history.length ? `<section class="history-list">${state.history.map((entry, index) => { const previews = historyOutfits(entry); return `<article class="history-row"><div class="history-date"><strong>${new Date(entry.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</strong><span>${new Date(entry.createdAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span></div><div class="history-copy"><h2>${escapeHTML(entry.occasion)} · ${escapeHTML(entry.style)}</h2><p><i style="--dot:${PALETTE[entry.color]?.hex}"></i>${escapeHTML(entry.color)} · ${escapeHTML(entry.profile.size)} · ${escapeHTML(entry.profile.fit)} fit</p></div><div class="history-thumbnails">${previews.map(item => `<div class="history-outfit-preview">${flatLay(item.items, item.name)}</div>`).join("")}</div><button class="secondary-button" type="button" data-view-history="${index}" ${previews.length ? "" : "disabled"}>View outfits</button></article>`; }).join("")}</section>` : `<section class="empty-state"><div class="empty-icon">↶</div><h1>No history yet</h1><p>Your generated outfit sets will appear here.</p><button class="primary-button" type="button" data-navigate="generate">Generate your first set</button></section>`}`;
}

function chipChecks(name, values, selected = []) {
  return `<div class="chip-checks">${values.map(value => `<label><input type="checkbox" name="${name}" value="${value}" ${selected.includes(value) ? "checked" : ""}><span>${value}</span></label>`).join("")}</div>`;
}

function profileView() {
  return `<section class="page-intro"><div><p class="eyebrow">Account preferences</p><h1>Your profile</h1><p class="lede">Keep your recommendations aligned with how you actually dress.</p></div></section><div class="settings-layout"><aside class="profile-card"><span class="avatar">${initials(state.profile.name)}</span><h2>${escapeHTML(state.profile.name)}</h2><p>${escapeHTML(state.profile.email)}</p><span class="status active">${hasPremium() ? "Premium member" : state.currentUser?.role === "admin" ? "Administrator" : "Member"}</span></aside><form id="profile-form" class="settings-form"><section class="panel"><p class="eyebrow">Personal information</p><h2>The essentials</h2><div class="form-grid"><div class="field"><label for="profile-name">Full name</label><input id="profile-name" name="name" value="${escapeHTML(state.profile.name)}" required></div><div class="field"><label for="profile-email">Email address</label><input id="profile-email" name="email" type="email" value="${escapeHTML(state.profile.email)}" required></div><div class="field"><label for="profile-gender">Clothing catalog</label><select id="profile-gender" name="gender">${GENDERS.map(value => `<option ${state.profile.gender === value ? "selected" : ""}>${value}</option>`).join("")}</select></div><div class="field"><label for="profile-size">Clothing size</label><select id="profile-size" name="size">${SIZES.map(value => `<option ${state.profile.size === value ? "selected" : ""}>${value}</option>`).join("")}</select></div><div class="field"><label for="profile-fit">Preferred fit</label><select id="profile-fit" name="fit">${FITS.map(value => `<option ${state.profile.fit === value ? "selected" : ""}>${value}</option>`).join("")}</select></div></div></section><section class="panel"><p class="eyebrow">Style preferences</p><h2>Make it feel like you</h2><label class="group-label">Favorite styles</label>${chipChecks("favoriteStyles", STYLES, state.profile.favoriteStyles)}<label class="group-label">Favorite colors</label>${chipChecks("favoriteColors", Object.keys(PALETTE).slice(0, 10), state.profile.favoriteColors)}<label class="group-label">Colors to avoid</label>${chipChecks("avoidColors", Object.keys(PALETTE).slice(0, 10), state.profile.avoidColors)}</section><div class="settings-actions"><button class="primary-button" type="submit">Save changes</button></div></form></div>`;
}

function money(value) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: MEMBERSHIP_CONFIG.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

function pricingView() {
  const annual = state.pricingCycle === "annual";
  const premiumPrice = annual ? MEMBERSHIP_CONFIG.premium.annualPrice : MEMBERSHIP_CONFIG.premium.monthlyPrice;
  const access = state.currentUser ? membership() : null;
  const header = state.currentUser ? "" : `<header class="pricing-header">${brandLogo("home", true)}<button class="secondary-button compact-button" type="button" data-navigate="login">Log in</button></header>`;
  const partnershipSubject = encodeURIComponent("Pormatch partnership proposal");
  const partnershipBody = encodeURIComponent("Hello Pormatch,\n\nI would like to propose an advertisement or featured promotion.\n\nBrand or creator name:\nCampaign idea:\nAudience and channels:\nPreferred dates:\nContact details:\n");
  const partnershipHref = `mailto:${PARTNERSHIP_EMAIL}?subject=${partnershipSubject}&body=${partnershipBody}`;
  const premiumAction = !state.currentUser
    ? '<button class="primary-button" type="button" data-navigate="login">Log in to activate demo</button>'
    : access.plan === "premium" && access.billingCycle === state.pricingCycle
      ? `<span class="current-plan">${annual ? "Annual" : "Monthly"} Premium is active</span>`
      : `<button class="primary-button" type="button" data-activate-plan="premium">${access.plan === "premium" ? `Switch to ${annual ? "Annual" : "Monthly"} demo` : "Choose Premium"}</button>`;
  const extras = `<section class="pricing-extras" aria-label="Other proposed revenue sources"><article class="pricing-extra"><div><p class="eyebrow">Optional add-on</p><h2>Style Packs</h2><p>Proposed themed packs for both Free and Premium members. Each pack would be a separate purchase.</p></div><div class="pricing-extra-side"><strong>${money(MEMBERSHIP_CONFIG.stylePack.price)} <small>/pack</small></strong><span class="pricing-extra-status">Coming soon</span></div></article><article class="pricing-extra"><div><p class="eyebrow">For brands and creators</p><h2>Advertisements &amp; featured promotions</h2><p>Send your campaign idea, audience, and preferred dates to Pormatch. Every proposal is reviewed before a placement and rate are agreed.</p></div><div class="pricing-extra-side"><strong>Negotiated rate</strong><a class="secondary-button" href="${partnershipHref}">Email Pormatch</a></div></article></section>`;
  return `<section class="pricing-page page--viewport">${header}<div class="pricing-content"><div class="pricing-heading"><div><p class="eyebrow">Membership and extras</p><h1>Choose more ways to style.</h1><p>Start free, choose Premium, or explore our proposed add-ons.</p></div><div class="billing-toggle" role="group" aria-label="Premium billing cycle"><button type="button" data-billing="monthly" aria-pressed="${!annual}" class="${!annual ? "active" : ""}">Monthly</button><button type="button" data-billing="annual" aria-pressed="${annual}" class="${annual ? "active" : ""}">Annual</button></div></div><section class="pricing-grid" aria-label="Membership plans"><article class="price-card"><p class="eyebrow">Free</p><h2>${money(0)} <small>forever</small></h2><ul><li>${MEMBERSHIP_CONFIG.free.generationLimit} outfit generations</li><li>Save up to ${MEMBERSHIP_CONFIG.free.savedLimit} looks</li><li>${MEMBERSHIP_CONFIG.free.historyLimit} recent searches</li></ul>${!state.currentUser ? '<button class="secondary-button" type="button" data-navigate="signup">Create free account</button>' : access.plan === "free" ? '<span class="current-plan">Current plan</span>' : '<button class="secondary-button" type="button" data-activate-plan="free">Switch to Free demo</button>'}</article><article class="price-card featured"><span class="offer-tag">Most flexible</span><p class="eyebrow">${annual ? "Annual Premium" : "Premium"}</p><h2>${money(premiumPrice)} <small>/${annual ? "year" : "month"}</small></h2><ul><li>Unlimited outfit generations</li><li>Unlimited saves</li><li>Complete recommendation history</li></ul>${premiumAction}</article></section>${extras}<p class="pricing-note">These are proposed prices. Premium activation is a demonstration; no payment is collected here.</p></div></section>`;
}

function adminView() {
  if (state.currentUser?.role !== "admin") return `<section class="empty-state"><div class="empty-icon">!</div><h1>Administrator access required</h1><p>This area is only available to administrator accounts.</p><button class="primary-button" type="button" data-navigate="dashboard">Return home</button></section>`;
  const activeCount = state.catalog.filter(item => item.active).length;
  const overview = `<section class="stats-grid"><article><span>Registered users</span><strong>${state.users.length}</strong></article><article><span>Active clothing</span><strong>${activeCount}</strong></article><article><span>Outfit generations</span><strong>${state.generations}</strong></article></section><section class="admin-summary-grid"><article class="panel"><p class="eyebrow">Catalog health</p><h2>${activeCount} of ${state.catalog.length} items active</h2><p>Active clothing is available to the recommendation engine. Open Clothing to review or change inventory status.</p><button class="secondary-button" type="button" data-admin-tab="clothing">Manage clothing</button></article><article class="panel"><p class="eyebrow">Recommendation activity</p><h2>${state.history.length} recent searches</h2><p>Generation history shows how often the recommendation flow has been used.</p></article></section>`;
  const clothing = `<section class="admin-grid"><div class="panel"><div class="panel-heading"><div><p class="eyebrow">Inventory</p><h2>Clothing catalog</h2></div><label class="table-search">${icon("search")}<input id="admin-search" type="search" placeholder="Search clothing"></label></div><div class="table-wrap"><table><thead><tr><th>Item</th><th>Category</th><th>Catalog</th><th>Fit</th><th>Color</th><th>Status</th><th>Action</th></tr></thead><tbody>${state.catalog.map(item => `<tr data-admin-row="${escapeHTML(`${item.name} ${item.category} ${item.color}`.toLowerCase())}"><td><strong>${escapeHTML(item.name)}</strong><small>${item.id}</small></td><td>${escapeHTML(item.category)}</td><td>${escapeHTML(item.gender || "Unisex")}</td><td>${escapeHTML(item.fit || "All fits")}</td><td><span class="table-color"><i style="--dot:${PALETTE[item.color]?.hex || "#ded6c8"}"></i>${escapeHTML(item.color)}</span></td><td><span class="status ${item.active ? "active" : "inactive"}">${item.active ? "Active" : "Inactive"}</span></td><td><button class="text-link" type="button" data-toggle-item="${item.id}">${item.active ? "Deactivate" : "Activate"}</button></td></tr>`).join("")}<tr id="admin-empty-row" hidden><td colspan="7" class="table-empty">No clothing matches your search.</td></tr></tbody></table></div></div><aside class="panel add-item"><p class="eyebrow">New inventory</p><h2>Add clothing</h2><form id="catalog-form"><div class="field"><label for="item-name">Item name</label><input id="item-name" name="name" required></div><div class="form-grid"><div class="field"><label for="item-category">Category</label><select id="item-category" name="category">${["Top","Bottom","Outerwear","Dress","Shoes","Accessory"].map(value => `<option>${value}</option>`).join("")}</select></div><div class="field"><label for="item-gender">Catalog</label><select id="item-gender" name="gender">${["Woman","Man","Unisex"].map(value => `<option>${value}</option>`).join("")}</select></div></div><div class="field"><label for="item-fit">Fit</label><select id="item-fit" name="fit">${[...FITS,"All fits"].map(value => `<option>${value}</option>`).join("")}</select></div><div class="field"><label for="item-color">Color</label><select id="item-color" name="color">${Object.keys(PALETTE).map(value => `<option>${value}</option>`).join("")}</select></div><div class="field"><label for="item-sizes">Available sizes</label><input id="item-sizes" name="sizes" value="S–XL" required></div><div class="field"><label for="item-styles">Compatible styles</label><input id="item-styles" name="styles" placeholder="Casual, Smart Casual" required></div><button class="primary-button" type="submit">Add item</button></form></aside></section>`;
  const users = `<section class="panel"><div class="panel-heading"><div><p class="eyebrow">Accounts</p><h2>Registered users</h2></div><span class="status active">${state.users.filter(user => user.active).length} active</span></div><div class="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Catalog</th><th>Role</th><th>Status</th></tr></thead><tbody>${state.users.map(user => `<tr><td><strong>${escapeHTML(user.name)}</strong></td><td>${escapeHTML(user.email)}</td><td>${escapeHTML(user.gender || "Not set")}</td><td>${escapeHTML(user.role)}</td><td><span class="status ${user.active ? "active" : "inactive"}">${user.active ? "Active" : "Inactive"}</span></td></tr>`).join("")}</tbody></table></div></section>`;
  const sections = { overview, clothing, users };
  const labels = { overview: "Overview", clothing: "Clothing", users: "Users" };
  return `<section class="page-intro"><div><p class="eyebrow">Pormatch administration</p><h1>${labels[adminSection]}</h1><p class="lede">Manage the clothing catalog and user accounts.</p></div></section><nav class="admin-tabs" aria-label="Administrator sections">${Object.entries(labels).map(([id, label]) => `<button type="button" class="${adminSection === id ? "active" : ""}" data-admin-tab="${id}" aria-current="${adminSection === id ? "page" : "false"}">${label}</button>`).join("")}</nav>${sections[adminSection]}`;
}

function render() {
  let route = routeName();
  const publicRoutes = ["home", "login", "signup", "privacy", "terms", "error", "pricing"];
  const protectedRoutes = ["onboarding", "dashboard", "generate", "results", "saved", "history", "profile", "admin"];
  const validRoutes = [...publicRoutes, ...protectedRoutes];

  if (!validRoutes.includes(route)) {
    route = "not-found";
  }
  if (protectedRoutes.includes(route) && !state.currentUser) {
    navigate("login", { replace: true });
    return;
  }
  if (["login", "signup"].includes(route) && state.currentUser) {
    navigate("dashboard", { replace: true });
    return;
  }

  navigation(route);
  const app = $("#app");
  document.body.className = state.currentUser && route !== "onboarding" ? `app-layout route-${route}` : `route-${route}`;
  app.className = `shell ${["home", "login", "signup", "onboarding", "privacy", "terms", "error", "not-found"].includes(route) ? "wide-shell" : ""} ${["home", "login", "onboarding", "dashboard", "pricing"].includes(route) ? "page--viewport" : ""}`;
  const views = { home: homeView, login: loginView, signup: signupView, privacy: privacyView, terms: termsView, error: errorView, "not-found": notFoundView, onboarding: onboardingView, dashboard: dashboardView, generate: generateView, results: resultsView, saved: savedView, history: historyView, profile: profileView, pricing: pricingView, admin: adminView };
  app.innerHTML = views[route]();
  bindEvents(route);
  app.focus({ preventScroll: true });
}

function bindCommonOutfitEvents() {
  $$('[data-save]').forEach(button => button.addEventListener("click", () => saveOutfit(button.dataset.save)));
  $$('[data-details]').forEach(button => button.addEventListener("click", () => showDetails(button.dataset.details)));
}

function bindEvents(route) {
  $$('[data-navigate]').forEach(element => element.addEventListener("click", () => navigate(element.dataset.navigate)));
  $$('[data-logout]').forEach(element => element.addEventListener("click", () => { state.currentUser = null; saveState(); navigate("home"); }));
  $$('[data-billing]').forEach(button => button.addEventListener("click", () => { state.pricingCycle = button.dataset.billing; saveState(); render(); }));
  $$('[data-activate-plan]').forEach(button => button.addEventListener("click", () => openActivationReview({ type: "plan", id: button.dataset.activatePlan }, button)));
  $$('[data-password-toggle], [data-password-targets]').forEach(button => button.addEventListener("click", () => {
    const targetIds = (button.dataset.passwordTargets || button.dataset.passwordToggle || "").split(/\s+/).filter(Boolean);
    const inputs = targetIds.map(id => document.getElementById(id)).filter(input => input instanceof HTMLInputElement);
    if (!inputs.length) return;
    const reveal = inputs.some(input => input.type === "password");
    inputs.forEach(input => { input.type = reveal ? "text" : "password"; });
    button.textContent = reveal ? "Hide" : "Show";
    button.setAttribute("aria-pressed", String(reveal));
    const subject = inputs.length > 1 ? "password and confirm password" : "password";
    button.setAttribute("aria-label", `${reveal ? "Hide" : "Show"} ${subject}`);
  }));

  if (route === "login") {
    $("#demo-login")?.addEventListener("click", () => { state.currentUser = { id: 1, name: "Maya Santos", email: "demo@pormatch.local", gender: "Woman", role: "admin" }; state.profile = { ...state.profile, name: "Maya Santos", email: "demo@pormatch.local", gender: "Woman", size: "M", fit: "Regular" }; state.selection = { occasion: "Work", style: "Smart Casual", color: "Red" }; state.results = []; saveState(); navigate("generate"); toast("Demo account opened."); });
    $("#login-form")?.addEventListener("submit", event => { event.preventDefault(); const data = new FormData(event.currentTarget); const user = state.users.find(item => item.email.toLowerCase() === String(data.get("email")).toLowerCase() && item.password === data.get("password") && item.active); if (!user) return toast("Email or password is incorrect."); state.currentUser = { id: user.id, name: user.name, email: user.email, gender: user.gender || "Prefer not to say", role: user.role }; state.profile = { ...state.profile, name: user.name, email: user.email, gender: user.gender || state.profile.gender }; saveState(); navigate("generate"); });
  }
  if (route === "signup") {
    $("#signup-form")?.addEventListener("submit", event => { event.preventDefault(); const data = new FormData(event.currentTarget); const email = String(data.get("email")).trim().toLowerCase(); if (data.get("password") !== data.get("confirmation")) return toast("Passwords do not match."); if (state.users.some(user => user.email.toLowerCase() === email)) return toast("That email is already registered."); const user = { id: Date.now(), name: String(data.get("name")).trim(), email, password: String(data.get("password")), gender: String(data.get("gender")), role: "user", active: true }; state.users.push(user); state.currentUser = { id: user.id, name: user.name, email, gender: user.gender, role: "user" }; state.profile = { ...state.profile, name: user.name, email, gender: user.gender }; saveState(); navigate("onboarding"); });
  }
  if (route === "error") $("#retry-page")?.addEventListener("click", () => location.reload());
  if (route === "onboarding") $("#onboarding-form")?.addEventListener("submit", event => { event.preventDefault(); const data = new FormData(event.currentTarget); state.profile.size = String(data.get("size")); state.profile.fit = String(data.get("fit")); saveState(); navigate("generate"); toast("Preferences saved."); });
  if (["dashboard", "generate", "results", "saved"].includes(route)) bindCommonOutfitEvents();
  if (route === "generate") {
    const form = $("#generator-form");
    form?.addEventListener("submit", generateOutfits);
    form?.querySelector('select[name="color"]')?.addEventListener("change", event => {
      const color = event.target.value;
      const palette = PALETTE[color];
      if (!palette) return;
      const panel = form.closest(".generator-panel");
      const helper = panel.querySelector(".color-helper");
      helper.querySelector("i")?.style.setProperty("--dot", palette.hex);
      helper.querySelector("strong").textContent = color;
      helper.querySelector("span").lastChild.textContent = ` pairs beautifully with ${palette.matches.join(", ")}.`;
    });
  }
  if (route === "results") $("#generate-again")?.addEventListener("click", generateOutfits);
  if (route === "saved") {
    $$('[data-remove]').forEach(button => button.addEventListener("click", () => { const item = state.saved.find(x => x.id === button.dataset.remove); if (!item || !confirm(`Remove ${item.name} from saved outfits?`)) return; state.saved = state.saved.filter(x => x.id !== item.id); saveState(); render(); toast("Outfit removed."); }));
  }
  if (route === "history") $$('[data-view-history]').forEach(button => button.addEventListener("click", () => { const entry = state.history[Number(button.dataset.viewHistory)]; if (!entry) return; const outfits = historyOutfits(entry); if (!outfits.length) return; state.selection = { occasion: entry.occasion, style: entry.style, color: entry.color }; state.results = outfits; saveState(); navigate("results"); }));
  if (route === "profile") {
    $("#profile-form")?.addEventListener("submit", event => { event.preventDefault(); const data = new FormData(event.currentTarget); state.profile = { ...state.profile, name: String(data.get("name")).trim(), email: String(data.get("email")).trim(), gender: String(data.get("gender")), size: String(data.get("size")), fit: String(data.get("fit")), favoriteStyles: data.getAll("favoriteStyles"), favoriteColors: data.getAll("favoriteColors"), avoidColors: data.getAll("avoidColors") }; Object.assign(state.currentUser, { name: state.profile.name, email: state.profile.email, gender: state.profile.gender }); saveState(); render(); toast("Profile changes saved."); });
  }
  if (route === "admin") {
    $$('[data-admin-tab]').forEach(button => button.addEventListener("click", () => { adminSection = button.dataset.adminTab; render(); }));
    $$('[data-toggle-item]').forEach(button => button.addEventListener("click", () => { const item = state.catalog.find(entry => entry.id === button.dataset.toggleItem); if (!item) return; item.active = !item.active; saveState(); render(); toast(`${item.name} is now ${item.active ? "active" : "inactive"}.`); }));
    $("#admin-search")?.addEventListener("input", event => { const query = event.currentTarget.value.trim().toLowerCase(); const rows = $$('[data-admin-row]'); rows.forEach(row => { row.hidden = !row.dataset.adminRow.includes(query); }); $("#admin-empty-row").hidden = rows.some(row => !row.hidden); });
    $("#catalog-form")?.addEventListener("submit", event => { event.preventDefault(); const data = new FormData(event.currentTarget); const prefix = ({ Top: "TOP", Bottom: "BOT", Outerwear: "OUT", Dress: "DRS", Shoes: "SHO", Accessory: "ACC" })[data.get("category")] || "ITM"; state.catalog.push({ id: `${prefix}-${String(state.catalog.length + 1).padStart(3,"0")}`, name: String(data.get("name")).trim(), category: String(data.get("category")), gender: String(data.get("gender")), fit: String(data.get("fit")), color: String(data.get("color")), sizes: String(data.get("sizes")), styles: String(data.get("styles")), image: "", active: true }); saveState(); render(); toast("Clothing item added."); });
  }
}

async function generateOutfits(event) {
  event?.preventDefault?.();
  const access = membership();
  if (!hasPremium() && access.generationsUsed >= MEMBERSHIP_CONFIG.free.generationLimit) {
    openUpgradePrompt("generation-limit", event?.submitter || event?.currentTarget);
    return;
  }
  if (event?.currentTarget instanceof HTMLFormElement) { const data = new FormData(event.currentTarget); state.selection = { occasion: String(data.get("occasion")), style: String(data.get("style")), color: String(data.get("color")) }; }
  $("#app").innerHTML = loadingView();
  const minimumLoading = new Promise(resolve => setTimeout(resolve, 450));
  minimumLoading.then(() => {
    const ranked = generateOfflineOutfits();
    state.results = ranked;
    state.generations += 1;
    access.generationsUsed += 1;
    const historyWasFull = !hasPremium() && state.history.length >= MEMBERSHIP_CONFIG.free.historyLimit;
    state.history.unshift({ ...state.selection, profile: { ...state.profile }, outfitIds: state.results.map(item => item.id), outfits: state.results, createdAt: new Date().toISOString() });
    state.history = state.history.slice(0, hasPremium() ? 30 : MEMBERSHIP_CONFIG.free.historyLimit);
    saveState();
    navigate("results");
    toast("Three new outfits are ready.");
    const remaining = MEMBERSHIP_CONFIG.free.generationLimit - access.generationsUsed;
    if (!hasPremium() && (remaining === 2 || historyWasFull)) setTimeout(() => openUpgradePrompt(historyWasFull ? "history-limit" : "two-generations"), 80);
  }).catch(error => {
    console.error(error);
    state.results = generateOfflineOutfits();
    saveState();
    navigate("results");
    toast("Unable to complete that outfit set. Please try another combination.");
  });
}

function saveOutfit(id) {
  const outfit = state.results.find(item => item.id === id) || OUTFITS.find(item => item.id === id) || rankedOutfits().find(item => item.id === id);
  if (!outfit) return;
  const saved = state.saved.some(item => item.id === id);
  if (!saved && !hasPremium() && state.saved.length >= MEMBERSHIP_CONFIG.free.savedLimit) {
    openUpgradePrompt("saved-limit");
    return;
  }
  state.saved = saved ? state.saved.filter(item => item.id !== id) : [...state.saved, { ...outfit, savedAt: new Date().toISOString() }];
  saveState(); render(); toast(saved ? "Removed from saved outfits." : "Outfit saved.");
}

function openModal(dialog, trigger = document.activeElement) {
  document.body.classList.add("dialog-open");
  dialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
  }, { once: true });
  dialog.showModal();
}

function showSubscriptionDialog(markup, trigger = document.activeElement) {
  const dialog = $("#detail-dialog");
  if (dialog.open) dialog.close();
  dialog.innerHTML = markup;
  dialog.querySelectorAll("[data-close-dialog]").forEach(button => button.addEventListener("click", () => dialog.close()));
  openModal(dialog, trigger);
  dialog.querySelector("button, [href], input, select")?.focus();
  return dialog;
}

function openUpgradePrompt(reason, trigger = document.activeElement) {
  if (hasPremium()) return;
  const key = `${membershipKey()}:${reason}`;
  const lastDismissed = Number(state.promotionDismissals[key] || 0);
  if (Date.now() - lastDismissed < MEMBERSHIP_CONFIG.promotionCooldownMs) {
    toast("Your Free plan limit is shown in Profile. Plans are available whenever you are ready.");
    return;
  }
  const messages = {
    "two-generations": ["Two free generations remain", "You can keep styling on Free. Premium removes the generation limit whenever you need more room."],
    "generation-limit": ["You have used your free generations", `Free includes ${MEMBERSHIP_CONFIG.free.generationLimit} generations. View the demonstration plans to continue creating outfits.`],
    "saved-limit": ["Your Free saved-outfit space is full", `Free keeps up to ${MEMBERSHIP_CONFIG.free.savedLimit} looks. Premium removes the save limit.`],
    "history-limit": ["Your oldest search has left Free history", `Free keeps your ${MEMBERSHIP_CONFIG.free.historyLimit} most recent searches. Premium keeps the full demonstration history.`]
  };
  const [title, copy] = messages[reason] || ["More styling room is available", "Review the Free and Premium demonstration plans when it suits you."];
  const dialog = showSubscriptionDialog(`<section class="subscription-dialog" aria-labelledby="upgrade-prompt-title"><button class="dialog-close" type="button" data-close-dialog aria-label="Close">${icon("close")}</button><p class="eyebrow">Plan suggestion</p><h1 id="upgrade-prompt-title">${title}</h1><p>${copy}</p><div class="dialog-actions"><button class="primary-button" type="button" data-view-plans>View plans</button><button class="secondary-button" type="button" data-dismiss-promo>Not now</button></div></section>`, trigger);
  dialog.querySelector("[data-view-plans]").addEventListener("click", () => { dialog.close(); navigate("pricing"); });
  dialog.querySelector("[data-dismiss-promo]").addEventListener("click", () => { state.promotionDismissals[key] = Date.now(); saveState(); dialog.close(); });
}

function openActivationReview(selection, trigger = document.activeElement) {
  if (!state.currentUser) { navigate("login"); return; }
  const access = membership();
  if (selection.type === "plan" && selection.id === "free") {
    access.plan = "free";
    access.billingCycle = null;
    saveState();
    render();
    toast("Free demonstration plan restored.");
    return;
  }
  const item = { name: "Premium", price: state.pricingCycle === "annual" ? MEMBERSHIP_CONFIG.premium.annualPrice : MEMBERSHIP_CONFIG.premium.monthlyPrice };
  const priceLabel = `${money(item.price)}/${state.pricingCycle === "annual" ? "year" : "month"}`;
  const dialog = showSubscriptionDialog(`<form class="subscription-dialog" id="activation-review" aria-labelledby="activation-title"><button class="dialog-close" type="button" data-close-dialog aria-label="Close">${icon("close")}</button><p class="eyebrow">Activation review</p><h1 id="activation-title">Activate ${escapeHTML(item.name)}?</h1><p>You are selecting the ${escapeHTML(state.pricingCycle)} Premium demonstration for <strong>${priceLabel}</strong>.</p><div class="prototype-notice"><strong>This is a prototype.</strong><span>No real payment will be processed, and no financial information is requested.</span></div><div class="dialog-actions"><button class="primary-button" type="submit">Confirm demo activation</button><button class="secondary-button" type="button" data-close-dialog>Cancel</button></div></form>`, trigger);
  dialog.querySelector("#activation-review").addEventListener("submit", event => {
    event.preventDefault();
    access.plan = "premium";
    access.billingCycle = state.pricingCycle;
    saveState();
    dialog.close();
    render();
    toast(`${item.name} demonstration activated.`);
  });
}

function outfitById(id) { return state.saved.find(item => item.id === id) || state.results.find(item => item.id === id) || OUTFITS.find(item => item.id === id); }

function showDetails(id) {
  const outfit = outfitById(id); if (!outfit) return;
  const dialog = $("#detail-dialog"); const isSaved = state.saved.some(item => item.id === id);
  dialog.innerHTML = `<div class="detail-layout"><div class="detail-visual">${flatLay(outfit.items, outfit.name)}</div><div class="detail-content"><button class="dialog-close" type="button" aria-label="Close">${icon("close")}</button><p class="eyebrow">${escapeHTML(outfit.style)} · ${outfit.score || outfit.baseScore}% match</p><h1>${escapeHTML(outfit.name)}</h1><p class="lede">${escapeHTML(outfit.explanation || "A complete coordinated look selected around your activity, size, preferred fit and color direction.")}</p>${paletteDots(outfit.colors)}<dl><div><dt>Activity</dt><dd>${escapeHTML(state.selection.occasion || "Everyday")}</dd></div><div><dt>Size & fit</dt><dd>${escapeHTML(state.profile.size)} · ${escapeHTML(outfit.fit)}</dd></div></dl><h3>Included pieces</h3><div class="item-list">${outfit.items.map(item => `<span>${escapeHTML(item.name)}</span>`).join("")}</div><div class="dialog-actions"><button class="primary-button" type="button" data-dialog-save="${id}">${isSaved ? "Remove saved" : "Save outfit"}</button></div></div></div>`;
  $(".dialog-close", dialog).addEventListener("click", () => dialog.close());
  $("[data-dialog-save]", dialog).addEventListener("click", () => { dialog.close(); saveOutfit(id); });
  openModal(dialog);
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", () => {
  render();
}, { once: true });

