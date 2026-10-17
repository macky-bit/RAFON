<?php declare(strict_types=1); ?>
<section id="journal-view" class="hidden journal-view">
    <div class="journal-book bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div class="journal-toolbar">
            <label class="journal-search" for="journal-search">
                <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                <input type="search" id="journal-search" placeholder="Search journals" aria-label="Search journals">
            </label>
            <div class="journal-toolbar-controls">
                <label class="journal-year-filter" for="journal-year-filter">Year:
                    <select id="journal-year-filter"><option value="ALL">All years</option></select>
                </label>
                <div class="journal-toolbar-actions">
                    <button type="button" id="new-entry-button" aria-label="Post a new journal entry" class="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 text-sm shadow-md shadow-emerald-600/20 transition-all hover:shadow-lg">
                        <i class="fa-solid fa-plus text-xs" aria-hidden="true"></i>
                        <span>Post Entry</span>
                    </button>
                    <button type="button" id="print-journal-button" class="journal-print-button">
                        <i class="fa-solid fa-print" aria-hidden="true"></i>
                        <span>Print Journal</span>
                    </button>
                </div>
            </div>
        </div>

        <p id="journal-feedback" class="journal-feedback hidden" role="alert"></p>

        <div id="journal-years-container" class="journal-years-container"></div>
    </div>
</section>
