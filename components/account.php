<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/session.php';

startAppSession();
$accountUser = requireAuthenticatedUser();
$accountName = htmlspecialchars((string) $accountUser['fullName'], ENT_QUOTES, 'UTF-8');
$accountEmail = htmlspecialchars((string) $accountUser['email'], ENT_QUOTES, 'UTF-8');
$accountRole = htmlspecialchars(ucfirst((string) $accountUser['role']), ENT_QUOTES, 'UTF-8');
$parts = preg_split('/\s+/', trim((string) $accountUser['fullName'])) ?: [];
$accountInitials = htmlspecialchars(mb_strtoupper(implode('', array_map(static fn(string $part): string => mb_substr($part, 0, 1), array_slice($parts, 0, 2)))), ENT_QUOTES, 'UTF-8');
?>
<section id="profile-view" class="hidden account-view">
    <div class="account-identity-card">
        <span class="account-avatar" data-account-initials aria-hidden="true"><?= $accountInitials ?></span>
        <div class="account-identity-copy">
            <span class="account-kicker">Team member</span>
            <h2 data-account-name><?= $accountName ?></h2>
            <p><?= $accountEmail ?></p>
        </div>
        <span class="account-role-badge"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> <?= $accountRole ?></span>
    </div>

    <div class="account-panels">
        <article class="account-panel">
            <div class="account-panel-heading"><span class="account-panel-icon"><i class="fa-regular fa-id-card" aria-hidden="true"></i></span><div><h3>Personal details</h3><p>Information connected to your account.</p></div></div>
            <dl class="account-details">
                <div><dt>Full name</dt><dd data-account-name><?= $accountName ?></dd></div>
                <div><dt>Email address</dt><dd><?= $accountEmail ?></dd></div>
            </dl>
        </article>
        <article class="account-panel">
            <div class="account-panel-heading"><span class="account-panel-icon"><i class="fa-solid fa-shield-halved" aria-hidden="true"></i></span><div><h3>Workspace access</h3><p>Your current access to Compañero Rafon.</p></div></div>
            <dl class="account-details">
                <div><dt>Role</dt><dd><?= $accountRole ?></dd></div>
                <div><dt>Session</dt><dd><span class="account-session-badge">Signed in</span></dd></div>
            </dl>
            <button type="button" class="account-link-button" data-tab="settings">View account settings <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>
        </article>
    </div>
</section>

<section id="settings-view" class="hidden account-view">
    <div class="account-panels">
        <article class="account-panel">
            <div class="account-panel-heading"><span class="account-panel-icon"><i class="fa-regular fa-user" aria-hidden="true"></i></span><div><h3>Profile details</h3><p>Update the name shown across this workspace.</p></div></div>
            <form id="profile-settings-form" class="account-settings-form">
                <p id="profile-settings-status" class="account-form-status hidden" role="status" aria-live="polite" tabindex="-1"></p>
                <label class="account-form-field" for="settings-full-name">
                    <span>Full name</span>
                    <input type="text" id="settings-full-name" name="full_name" value="<?= $accountName ?>" minlength="2" maxlength="100" autocomplete="name" required>
                </label>
                <label class="account-form-field" for="settings-email">
                    <span>Sign-in email</span>
                    <input type="email" id="settings-email" value="<?= $accountEmail ?>" autocomplete="email" readonly>
                    <small>Contact an administrator if this sign-in address needs to change.</small>
                </label>
                <div class="account-form-actions">
                    <span>Access role: <strong><?= $accountRole ?></strong></span>
                    <button type="submit">Save profile</button>
                </div>
            </form>
            <button type="button" class="account-link-button" data-tab="profile">View my profile <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>
        </article>
        <article class="account-panel">
            <div class="account-panel-heading"><span class="account-panel-icon"><i class="fa-solid fa-lock" aria-hidden="true"></i></span><div><h3>Sign-in &amp; security</h3><p>Keep your account access secure.</p></div></div>
            <form id="password-settings-form" class="account-settings-form">
                <p id="password-settings-status" class="account-form-status hidden" role="status" aria-live="polite" tabindex="-1"></p>
                <label class="account-form-field" for="settings-current-password">
                    <span>Current password</span>
                    <input type="password" id="settings-current-password" name="current_password" autocomplete="current-password" required>
                </label>
                <label class="account-form-field" for="settings-new-password">
                    <span>New password</span>
                    <input type="password" id="settings-new-password" name="new_password" minlength="8" maxlength="72" autocomplete="new-password" aria-describedby="settings-password-help" required>
                    <small id="settings-password-help">Use 8 to 72 characters and choose a password you do not use elsewhere.</small>
                </label>
                <label class="account-form-field" for="settings-password-confirmation">
                    <span>Confirm new password</span>
                    <input type="password" id="settings-password-confirmation" name="password_confirmation" minlength="8" maxlength="72" autocomplete="new-password" required>
                </label>
                <label class="account-show-passwords"><input type="checkbox" id="settings-show-passwords"> <span>Show passwords</span></label>
                <div class="account-form-actions">
                    <span>Your current password is required.</span>
                    <button type="submit">Change password</button>
                </div>
            </form>
        </article>
    </div>
</section>
