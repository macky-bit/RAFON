<?php declare(strict_types=1); ?>
<section id="income-statement-view" class="hidden space-y-6">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-4xl mx-auto">
        <div class="text-center pb-6 border-b border-slate-200">
            <h2 class="text-xl font-bold text-slate-900 uppercase tracking-wide">Compañero Rafon Resto Grill & Seafoods</h2>
            <h3 class="text-md font-semibold text-emerald-700 uppercase mt-1">Income Statement</h3>
            <p class="text-xs text-slate-500 mt-1">All recorded journal entries</p>
        </div>

        <div class="mt-6 space-y-6 text-sm">
            <!-- Revenue Section -->
            <div>
                <h4 class="font-bold text-slate-800 uppercase border-b border-slate-200 pb-2 mb-3">Revenues & Sales</h4>
                <div id="is-revenues-list" class="space-y-2">
                    <!-- Dynamic JS Insert -->
                </div>
                <div class="flex justify-between items-center font-bold pt-2 border-t border-slate-200 mt-2">
                    <span class="text-slate-700">Total Operating Revenue</span>
                    <span id="is-total-revenue" class="mono text-emerald-600 font-semibold">₱ 0.00</span>
                </div>
            </div>

            <!-- Expenses Section -->
            <div>
                <h4 class="font-bold text-slate-800 uppercase border-b border-slate-200 pb-2 mb-3">Operating Expenses</h4>
                <div id="is-expenses-list" class="space-y-2">
                    <!-- Dynamic JS Insert -->
                </div>
                <div class="flex justify-between items-center font-bold pt-2 border-t border-slate-200 mt-2">
                    <span class="text-slate-700">Total Operating Expenses</span>
                    <span id="is-total-expenses" class="mono text-red-600 font-semibold">₱ 0.00</span>
                </div>
            </div>

            <!-- Net Income Summary Line -->
            <div class="bg-slate-50 p-4 rounded-xl border-2 border-slate-800 flex justify-between items-center">
                <div>
                    <span id="is-net-title" class="text-base font-bold text-slate-900 uppercase">Net Profit / Income</span>
                    <p class="text-xs text-slate-500">Included in the equity summary</p>
                </div>
                <span id="is-net-amount" class="text-xl font-extrabold mono text-emerald-600">₱ 0.00</span>
            </div>
        </div>
    </div>
</section>
