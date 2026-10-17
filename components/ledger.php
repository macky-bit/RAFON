<?php declare(strict_types=1); ?>
<section id="ledger-view" class="hidden space-y-6">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div class="flex items-center justify-end pb-4 border-b border-slate-200">
            <!-- Filter drop down for ledger accounts -->
            <div class="flex items-center space-x-3">
                <label for="ledger-year-filter" class="text-xs font-medium text-slate-600">Year:</label>
                <select id="ledger-year-filter" class="bg-slate-50 border border-slate-300 text-slate-800 rounded-lg text-xs py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="ALL">All years</option>
                </select>
                <label for="ledger-filter" class="text-xs font-medium text-slate-600">Select Account:</label>
                <select id="ledger-filter" class="bg-slate-50 border border-slate-300 text-slate-800 rounded-lg text-xs py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="ALL">All Ledger Accounts</option>
                    <!-- JS injected options -->
                </select>
            </div>
        </div>

        <p id="ledger-feedback" class="journal-feedback hidden" role="status" aria-live="polite"></p>

        <!-- General Ledger account tables -->
        <div id="ledger-accounts-container" class="mt-6 space-y-8">
            <!-- JS renders account tables here -->
        </div>
    </div>
</section>
