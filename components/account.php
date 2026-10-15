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
        <span class="account-avatar" aria-hidden="true"><?= $accountInitials ?></span>
        <div class="account-identity-copy">
            <span class="account-kicker">Team member</span>
            <h2><?= $accountName ?></h2>
            <p><?= $accountEmail ?></p>
        </div>
        <span class="account-role-badge"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> <?= $accountRole ?></span>
    </div>

    <div class="account-panels">
        <article class="account-panel">
            <div class="account-panel-heading"><span class="account-panel-icon"><i class="fa-regular fa-id-card" aria-hidden="true"></i></span><div><h3>Personal details</h3><p>Information connected to your account.</p></div></div>
            <dl class="account-details">
                <div><dt>Full name</dt><dd><?= $accountName ?></dd></div>
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
            <div class="account-panel-heading"><span class="account-panel-icon"><i class="fa-regular fa-user" aria-hidden="true"></i></span><div><h3>Account details</h3><p>The information currently used for your account.</p></div></div>
            <dl class="account-details">
                <div><dt>Full name</dt><dd><?= $accountName ?></dd></div>
                <div><dt>Sign-in email</dt><dd><?= $accountEmail ?></dd></div>
                <div><dt>Access role</dt><dd><?= $accountRole ?></dd></div>
            </dl>
            <button type="button" class="account-link-button" data-tab="profile">View my profile <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>
        </article>
        <article class="account-panel">
            <div class="account-panel-heading"><span class="account-panel-icon"><i class="fa-solid fa-lock" aria-hidden="true"></i></span><div><h3>Sign-in &amp; security</h3><p>Keep your account access secure.</p></div></div>
            <div class="account-security-note"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><p>Profile changes and password updates are not available in this workspace yet.</p></div>
        </article>
    </div>
</section>
