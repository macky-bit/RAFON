<?php declare(strict_types=1); ?>
<section id="home-view" class="landing-page">
    <div class="home-auth-layout">
        <div class="restaurant-hero">
            <div class="hero-copy">
                <span class="hero-kicker">Resto Grill & Seafoods · Bauang</span>
                <h1>Good food, honest books, <em>one better business.</em></h1>
                <p>Welcome to the central workspace for Compañero Rafon—where menu operations, supplier contacts, and financial records stay connected.</p>
            </div>
            <div class="hero-image-placeholder">
                <img src="img/seafod.jpg" alt="Fresh grilled seafood served at Compañero Rafon" class="w-full h-full object-cover rounded-2xl" width="2048" height="2048" decoding="async" fetchpriority="high" />
                <div class="hero-stamp"><strong>Fresh</strong><span>Grill · Seafood · Local</span></div>
            </div>
        </div>

        <aside class="auth-card" aria-labelledby="auth-title">
            <div class="auth-tabs" role="tablist" aria-label="Account access">
                <button type="button" id="auth-login-tab" role="tab" aria-selected="true" aria-controls="login-form" data-auth-mode="login">Login</button>
                <button type="button" id="auth-register-tab" role="tab" aria-selected="false" aria-controls="register-form" data-auth-mode="register" tabindex="-1">Register</button>
            </div>

            <div class="auth-heading">
                <h2 id="auth-title">Welcome back</h2>
                <p id="auth-subtitle">Sign in to manage your restaurant operations.</p>
            </div>

            <div class="auth-form-stage">
            <form id="login-form" class="auth-form" role="tabpanel" aria-labelledby="auth-login-tab">
                <div class="auth-field">
                    <label for="login-email">Email address</label>
                    <div class="auth-input"><i class="fa-regular fa-envelope" aria-hidden="true"></i><input type="email" id="login-email" name="email" autocomplete="email" placeholder="you@example.com" required></div>
                </div>
                <div class="auth-field">
                    <label for="login-password">Password</label>
                    <div class="auth-input"><i class="fa-solid fa-lock" aria-hidden="true"></i><input type="password" id="login-password" name="password" autocomplete="current-password" minlength="8" placeholder="Enter your password" required><button type="button" class="password-toggle" data-password-toggle="login-password" aria-label="Show password"><i class="fa-regular fa-eye" aria-hidden="true"></i></button></div>
                </div>
                <div class="auth-options">
                    <label><input type="checkbox" name="remember"> Remember me</label>
                    <button type="button" class="auth-text-button" data-auth-help>Forgot password?</button>
                </div>
                <button type="submit" class="auth-submit">Sign in <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>
                <p class="auth-switch">Don't have an account? <button type="button" data-auth-mode="register">Create account</button></p>
            </form>

            <form id="register-form" class="auth-form hidden" role="tabpanel" aria-labelledby="auth-register-tab">
                <div class="auth-field">
                    <label for="register-name">Full name</label>
                    <div class="auth-input"><i class="fa-regular fa-user" aria-hidden="true"></i><input type="text" id="register-name" name="full_name" autocomplete="name" minlength="2" maxlength="100" placeholder="Your full name" required></div>
                </div>
                <div class="auth-field">
                    <label for="register-email">Email address</label>
                    <div class="auth-input"><i class="fa-regular fa-envelope" aria-hidden="true"></i><input type="email" id="register-email" name="email" autocomplete="email" placeholder="you@example.com" required></div>
                </div>
                <div class="auth-field">
                    <label for="register-password">Password</label>
                    <div class="auth-input"><i class="fa-solid fa-lock" aria-hidden="true"></i><input type="password" id="register-password" name="password" autocomplete="new-password" minlength="8" placeholder="At least 8 characters" required><button type="button" class="password-toggle" data-password-toggle="register-password" aria-label="Show password"><i class="fa-regular fa-eye" aria-hidden="true"></i></button></div>
                </div>
                <div class="auth-field">
                    <label for="register-password-confirmation">Confirm password</label>
                    <div class="auth-input"><i class="fa-solid fa-shield-halved" aria-hidden="true"></i><input type="password" id="register-password-confirmation" name="password_confirmation" autocomplete="new-password" minlength="8" placeholder="Repeat your password" required></div>
                </div>
                <label class="auth-consent"><input type="checkbox" name="terms" required> I agree to the account and data-use policy.</label>
                <button type="submit" class="auth-submit">Create account <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>
                <p class="auth-switch">Already registered? <button type="button" data-auth-mode="login">Sign in</button></p>
            </form>
            </div>

            <p id="auth-message" class="auth-message hidden" role="status" aria-live="polite"></p>
        </aside>
    </div>

    <div class="services-section">
        <div class="section-heading">
            <div><span class="eyebrow">Services offered</span><h2>What we bring to the table</h2></div>
            <p>Built around good food, thoughtful service, and the warm welcome our guests remember.</p>
        </div>
        <div class="service-grid">
            <article class="service-card"><span>01</span><i class="fa-solid fa-fire-burner"></i><h3>Grill favorites</h3><p>Freshly prepared grilled dishes served hot from the kitchen.</p></article>
            <article class="service-card"><span>02</span><i class="fa-solid fa-fish-fins"></i><h3>Fresh seafood</h3><p>Local seafood selections prepared for dine-in and sharing.</p></article>
            <article class="service-card"><span>03</span><i class="fa-solid fa-champagne-glasses"></i><h3>Group dining</h3><p>Comfortable meals and service for families and celebrations.</p></article>
        </div>
    </div>

    <div class="menu-section">
        <div class="section-heading">
            <div><span class="eyebrow">Menu highlights</span><h2>Popular dishes</h2></div>
        </div>
        <div class="dish-grid">
            <article class="dish-card"><div class="dish-image"><img src="img/grilledseafoodplatter.jpg" alt="Grilled Seafood Platter" class="w-full h-full object-cover" width="1536" height="2048" loading="lazy" decoding="async" /></div><div class="dish-info"><div><span>Grill</span><h3>Grilled Seafood Platter</h3></div><strong>&#8369;680</strong></div></article>
            <article class="dish-card"><div class="dish-image accent-red"><img src="img/mixgrill.jpg" alt="Rafon Mixed Grill" class="w-full h-full object-cover" width="1536" height="2048" loading="lazy" decoding="async" /></div><div class="dish-info"><div><span>House favorite</span><h3>Rafon Mixed Grill</h3></div><strong>&#8369;520</strong></div></article>
            <article class="dish-card"><div class="dish-image accent-green"><img src="img/butteredshrimp.jpg" alt="Garlic Butter Shrimp" class="w-full h-full object-cover" width="2048" height="2048" loading="lazy" decoding="async" /></div><div class="dish-info"><div><span>Seafood</span><h3>Garlic Butter Shrimp</h3></div><strong>&#8369;360</strong></div></article>
            <article class="dish-card"><div class="dish-image accent-dark"><img src="img/bilao.jpg" alt="Family Bilao Special" class="w-full h-full object-cover" width="1536" height="2048" loading="lazy" decoding="async" /></div><div class="dish-info"><div><span>Sharing</span><h3>Family Bilao Special</h3></div><strong>&#8369;890</strong></div></article>
        </div>
    </div>
</section>
