<?php declare(strict_types=1); ?>
<section id="balance-sheet-view" class="hidden space-y-6">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-4xl mx-auto">
        <div class="text-center pb-6 border-b border-slate-200">
            <h2 class="text-xl font-bold text-slate-900 uppercase tracking-wide">Compañero Rafon Resto Grill & Seafoods</h2>
            <h3 class="text-md font-semibold text-emerald-700 uppercase mt-1">Statement of Financial Position (Balance Sheet)</h3>
            <p class="text-xs text-slate-500 mt-1">Based on all recorded journal entries</p>
        </div>

        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <!-- Left Side: Assets -->
            <div class="space-y-4">
                <h4 class="font-bold text-emerald-700 uppercase border-b-2 border-emerald-600 pb-2">Assets</h4>
                <div id="bs-assets-list" class="space-y-2">
                    <!-- Dynamic JS -->
                </div>
                <div class="flex justify-between items-center font-extrabold pt-3 border-t-2 border-slate-800">
                    <span>TOTAL ASSETS</span>
                    <span id="bs-total-assets" class="mono text-emerald-600">₱ 0.00</span>
                </div>
            </div>

            <!-- Right Side: Liabilities & Equity -->
            <div class="space-y-6">
                <!-- Liabilities -->
                <div class="space-y-4">
                    <h4 class="font-bold text-red-700 uppercase border-b-2 border-red-600 pb-2">Liabilities</h4>
                    <div id="bs-liabilities-list" class="space-y-2">
                        <!-- Dynamic JS -->
                    </div>
                    <div class="flex justify-between items-center font-bold pt-2 border-t border-slate-200">
                        <span>Total Liabilities</span>
                        <span id="bs-total-liabilities" class="mono text-red-600">₱ 0.00</span>
                    </div>
                </div>

                <!-- Owner's Equity -->
                <div class="space-y-4">
                    <h4 class="font-bold text-blue-700 uppercase border-b-2 border-blue-600 pb-2">Owner's Equity</h4>
                    <div id="bs-equity-list" class="space-y-2">
                        <!-- Dynamic JS -->
                    </div>
                    <div class="flex justify-between items-center font-bold pt-2 border-t border-slate-200">
                        <span>Total Equity</span>
                        <span id="bs-total-equity" class="mono text-blue-600">₱ 0.00</span>
                    </div>
                </div>

                <!-- Combined Total -->
                <div class="flex justify-between items-center font-extrabold pt-3 border-t-2 border-slate-800 bg-slate-50 p-2 rounded-lg">
                    <span>TOTAL LIABILITIES & EQUITY</span>
                    <span id="bs-total-liab-equity" class="mono text-slate-900">₱ 0.00</span>
                </div>
            </div>
        </div>
    </div>
</section>
