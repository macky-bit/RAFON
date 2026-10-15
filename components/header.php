<?php declare(strict_types=1); ?>
<header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shrink-0">
    <div class="flex items-center space-x-4">
        <!-- Sidebar Hamburger Toggle Button -->
        <button id="sidebar-toggle" class="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none transition-colors" title="Toggle navigation" aria-label="Toggle navigation" aria-controls="sidebar" aria-expanded="true">
            <i class="fa-solid fa-bars text-lg"></i>
        </button>
        <div>
            <p class="header-eyebrow">Compañero Rafon · Operations</p>
            <h1 id="page-title" class="text-xl font-bold text-slate-800 tracking-tight">Your business, at a glance.</h1>
            <p id="page-subtitle">Live accounting, supplier management, and catering performance in one unified workspace.</p>
        </div>
    </div>

    <div class="flex items-center space-x-3">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
            All recorded entries
        </span>
        <!-- Post Entry Trigger Modal Button -->
        <button id="new-entry-button" aria-label="Post a new journal entry" class="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm shadow-md shadow-emerald-600/20 transition-all hover:shadow-lg">
            <i class="fa-solid fa-plus text-xs"></i>
            <span>Post Entry</span>
        </button>
    </div>
</header>
