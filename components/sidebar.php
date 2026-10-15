<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/session.php';

startAppSession();
$sidebarUser = requireAuthenticatedUser();
$nameParts = preg_split('/\s+/', trim($sidebarUser['fullName'])) ?: [];
$initials = mb_strtoupper(implode('', array_map(static fn(string $part): string => mb_substr($part, 0, 1), array_slice($nameParts, 0, 2))));
?>
<aside id="sidebar" class="sidebar-expanded bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out z-30 shadow-xl border-r border-slate-800 shrink-0">
    <!-- Logo & Brand Section -->
    <div class="h-16 flex items-center px-4 bg-slate-950 border-b border-slate-800 justify-between">
        <div class="flex items-center space-x-3 overflow-hidden">
            <img class="brand-logo" src="img/logo.png" width="54" height="54" alt="">
            <div class="logo-text flex flex-col truncate">
                <span class="font-bold text-white text-sm tracking-wide uppercase truncate">Compañero Rafon</span>
                <span class="text-[10px] text-emerald-400 font-medium tracking-wider uppercase truncate">Resto Grill & Seafoods</span>
            </div>
        </div>
    </div>

    <button id="sidebar-close" type="button" aria-label="Close navigation"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>

    <!-- Navigation Links Block -->
    <div class="flex-1">
        <!-- Overview Group -->
        <div>
            <div class="nav-header text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Overview</div>
            <nav>
                <button id="nav-dashboard" aria-current="page" data-tab="dashboard" class="nav-item nav-active">
                    <span class="nav-text truncate">Dashboard</span>
                </button>
            </nav>
        </div>

        <!-- Supplier Contacts Group -->
        <div>
            <div class="nav-header text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Contacts</div>
            <nav>
                <button id="nav-suppliers" data-tab="suppliers" class="nav-item">
                    <span class="nav-text truncate">Supplier List</span>
                </button>
                <button id="nav-ingredients" data-tab="ingredients" class="nav-item">
                    <span class="nav-text truncate">Ingredients</span>
                </button>
            </nav>
        </div>

        <!-- Books of Accounts Group -->
        <div>
            <div class="nav-header text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Books of Accounts</div>
            <nav>
                <button id="nav-journal" data-tab="journal" class="nav-item">
                    <span class="nav-text truncate">General Journal</span>
                </button>
                <button id="nav-ledger" data-tab="ledger" class="nav-item">
                    <span class="nav-text truncate">General Ledger</span>
                </button>
            </nav>
        </div>

        <!-- Financial Reports Group -->
        <div>
            <div class="nav-header text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Financial Statements</div>
            <nav>
                <button id="nav-trial-balance" data-tab="trial-balance" class="nav-item">
                    <span class="nav-text truncate">Trial Balance</span>
                </button>
                <button id="nav-income-statement" data-tab="income-statement" class="nav-item">
                    <span class="nav-text truncate">Income Statement</span>
                </button>
                <button id="nav-balance-sheet" data-tab="balance-sheet" class="nav-item">
                    <span class="nav-text truncate">Balance Sheet</span>
                </button>
            </nav>
        </div>

        <!-- System Audit Group -->
        <div>
            <div class="nav-header text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Security & Logs</div>
            <nav>
                <button id="nav-audit-trail" data-tab="audit-trail" class="nav-item">
                    <span class="nav-text truncate">Audit Trail</span>
                </button>
            </nav>
        </div>
    </div>

    <!-- Logged-in account -->
    <div class="user-status">
        <span class="user-initials" role="img" aria-label="Logged in as <?= htmlspecialchars($sidebarUser['fullName'], ENT_QUOTES, 'UTF-8') ?>" title="<?= htmlspecialchars($sidebarUser['fullName'], ENT_QUOTES, 'UTF-8') ?>">
            <?= htmlspecialchars($initials, ENT_QUOTES, 'UTF-8') ?>
        </span>
        <button id="logout-button" type="button" aria-label="Sign out" title="Sign out"><i class="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i></button>
    </div>
</aside>
