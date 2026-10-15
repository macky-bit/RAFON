<?php declare(strict_types=1); ?>
<section id="journal-view" class="hidden journal-view">
    <div class="journal-book">
        <div class="journal-toolbar">
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

        <p id="journal-feedback" class="journal-feedback hidden" role="alert"></p>

        <!-- Standard Two-Column Debit/Credit Classic Accounting Table -->
        <div class="journal-table-wrap">
            <table class="journal-table">
                <thead>
                    <tr>
                        <th class="border border-slate-300 py-2.5 px-3 w-28 text-center">Date</th>
                        <th class="border border-slate-300 py-2.5 px-4 text-left">Account Titles & Explanation</th>
                        <th class="border border-slate-300 py-2.5 px-2 w-16 text-center">P.R.</th>
                        <th class="border border-slate-300 py-2.5 px-0 w-36 text-center" colspan="2">Debit (₱)</th>
                        <th class="border border-slate-300 py-2.5 px-0 w-36 text-center" colspan="2">Credit (₱)</th>
                        <th class="journal-actions-heading" scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody id="journal-table-body">
                    <!-- JS Injected Content with split peso & cents columns -->
                </tbody>
            </table>
        </div>
    </div>
</section>
