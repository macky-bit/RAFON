<?php declare(strict_types=1); ?>
<section id="ledger-view" class="hidden space-y-6">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
                <h2 class="text-xl font-bold text-slate-900">General Ledger</h2>
                <p class="text-xs text-slate-500">Individual T-Account record of secondary entries</p>
            </div>
            <!-- Filter drop down for ledger accounts -->
            <div class="flex items-center space-x-3">
                <label for="ledger-filter" class="text-xs font-medium text-slate-600">Select Account:</label>
                <select id="ledger-filter" class="bg-slate-50 border border-slate-300 text-slate-800 rounded-lg text-xs py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="ALL">All Ledger Accounts</option>
                    <!-- JS injected options -->
                </select>
            </div>
        </div>

        <!-- T-Account Ledger Blocks -->
        <div id="ledger-accounts-container" class="mt-6 space-y-8">
            <!-- JS Dynamic T-Accounts render here -->
        </div>
    </div>
</section>
