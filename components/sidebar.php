<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/session.php';

startAppSession();
$sidebarUser = requireAuthenticatedUser();
$nameParts = preg_split('/\s+/', trim($sidebarUser['fullName'])) ?: [];
$initials = mb_strtoupper(implode('', array_map(static fn(string $part): string => mb_substr($part, 0, 1), array_slice($nameParts, 0, 2))));
?>
<nav id="sidebar" class="sidebar-expanded bg-slate-900 text-slate-300 flex flex-row items-center justify-between transition-all duration-300 ease-in-out z-30 shadow-xl border-b border-slate-800 shrink-0" aria-label="Primary navigation">
    <div class="h-16 flex items-center px-4 bg-slate-950 border-b border-slate-800 justify-between">
        <a href="/dashboard" class="brand-link flex items-center space-x-3 overflow-hidden" aria-label="Compañero Rafon dashboard">
            <img class="brand-logo" src="img/logo.png" width="54" height="54" alt="">
            <div class="logo-text flex flex-col truncate">
                <span class="font-bold text-white text-sm tracking-wide uppercase truncate">Compañero Rafon</span>
                <span class="text-[10px] text-emerald-400 font-medium tracking-wider uppercase truncate">Resto Grill &amp; Seafoods</span>
            </div>
        </a>
    </div>

    <button id="sidebar-close" type="button" aria-label="Close navigation"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>

    <div class="flex-1">
        <div class="top-nav-links ml-auto flex items-center justify-end gap-2 px-2">
            <button type="button" id="nav-dashboard" aria-current="page" data-tab="dashboard" class="nav-item nav-active flex px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800">
                <span class="nav-text">Dashboard</span>
            </button>

            <div class="nav-group">
                <button type="button" class="nav-dropdown-toggle w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800" aria-expanded="false" aria-controls="inventory-submenu">
                    <span>Inventory</span><i class="fa-solid fa-chevron-down text-xs transition-transform duration-200" aria-hidden="true"></i>
                </button>
                <div id="inventory-submenu" class="nav-submenu pl-6 space-y-1 hidden" inert>
                    <button type="button" id="nav-ingredients" data-tab="ingredients" class="nav-item w-full text-left px-3 py-2 text-xs hover:text-white"><span class="nav-text">Ingredients</span></button>
                    <button type="button" id="nav-suppliers" data-tab="suppliers" class="nav-item w-full text-left px-3 py-2 text-xs hover:text-white"><span class="nav-text">Supplier List</span></button>
                </div>
            </div>

            <div class="nav-group">
                <button type="button" class="nav-dropdown-toggle w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800" aria-expanded="false" aria-controls="accounting-submenu">
                    <span>Accounting</span><i class="fa-solid fa-chevron-down text-xs transition-transform duration-200" aria-hidden="true"></i>
                </button>
                <div id="accounting-submenu" class="nav-submenu pl-6 space-y-1 hidden" inert>
                    <button type="button" id="nav-journal" data-tab="journal" class="nav-item w-full text-left px-3 py-2 text-xs hover:text-white"><span class="nav-text">General Journal</span></button>
                    <button type="button" id="nav-ledger" data-tab="ledger" class="nav-item w-full text-left px-3 py-2 text-xs hover:text-white"><span class="nav-text">General Ledger</span></button>
                    <button type="button" id="nav-trial-balance" data-tab="trial-balance" class="nav-item w-full text-left px-3 py-2 text-xs hover:text-white"><span class="nav-text">Trial Balance</span></button>
                    <button type="button" id="nav-income-statement" data-tab="income-statement" class="nav-item w-full text-left px-3 py-2 text-xs hover:text-white"><span class="nav-text">Income Statement</span></button>
                    <button type="button" id="nav-balance-sheet" data-tab="balance-sheet" class="nav-item w-full text-left px-3 py-2 text-xs hover:text-white"><span class="nav-text">Balance Sheet</span></button>
                </div>
            </div>

            <button type="button" id="nav-audit-trail" data-tab="audit-trail" class="nav-item flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800"><span class="nav-text">Audit Trail</span></button>
        </div>
    </div>

    <div class="user-status nav-group relative ml-auto">
        <button type="button" class="user-initials nav-dropdown-toggle bg-slate-700 rounded-full w-10 h-10 flex items-center justify-center" aria-label="Open profile menu for <?= htmlspecialchars($sidebarUser['fullName'], ENT_QUOTES, 'UTF-8') ?>" title="<?= htmlspecialchars($sidebarUser['fullName'], ENT_QUOTES, 'UTF-8') ?>" aria-expanded="false" aria-controls="profile-submenu">
            <?= htmlspecialchars($initials, ENT_QUOTES, 'UTF-8') ?>
        </button>
        <div id="profile-submenu" class="nav-submenu pl-6 space-y-1 hidden" inert>
            <button type="button" id="nav-profile" data-tab="profile" class="nav-item w-full text-left px-3 py-2 text-xs hover:text-white"><span class="nav-text">My Profile</span></button>
            <button type="button" id="nav-settings" data-tab="settings" class="nav-item w-full text-left px-3 py-2 text-xs hover:text-white"><span class="nav-text">Account Setting</span></button>
            <button type="button" id="logout-button" class="w-full text-left px-3 py-2 text-xs text-red-400 hover:text-red-300">Logout</button>
        </div>
    </div>
</nav>
