<?php declare(strict_types=1); ?>
<section id="trial-balance-view" class="hidden space-y-6">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-4xl mx-auto">
        <div class="text-center pb-6 border-b border-slate-200">
            <h2 class="text-xl font-bold text-slate-900 uppercase tracking-wide">Compañero Rafon Resto Grill & Seafoods</h2>
            <h3 class="text-md font-semibold text-emerald-700 uppercase mt-1">Trial Balance</h3>
            <p class="text-xs text-slate-500 mt-1">All recorded journal entries</p>
        </div>

        <div class="mt-6 overflow-x-auto">
            <table class="w-full text-sm border-collapse border border-slate-300">
                <thead>
                    <tr class="bg-slate-800 text-white uppercase text-xs">
                        <th class="border border-slate-300 py-2.5 px-4 text-left">Account Title</th>
                        <th class="border border-slate-300 py-2.5 px-0 w-40 text-center" colspan="2">Debit (₱)</th>
                        <th class="border border-slate-300 py-2.5 px-0 w-40 text-center" colspan="2">Credit (₱)</th>
                    </tr>
                </thead>
                <tbody id="trial-balance-body" class="divide-y divide-slate-200">
                    <!-- JS Rendered Dynamic Content -->
                </tbody>
                <tfoot>
                    <tr class="bg-slate-100 font-bold border-t-2 border-slate-800">
                        <td class="py-3 px-4 border border-slate-300 text-slate-900">Total Trial Balance</td>
                        <td class="py-3 px-2 border-y border-l border-slate-300 text-right mono w-28 text-emerald-700" id="tb-total-debit-p">0</td>
                        <td class="py-3 px-1 border-y border-r border-slate-300 text-center mono w-8 text-emerald-700 border-split" id="tb-total-debit-c">00</td>
                        <td class="py-3 px-2 border-y border-l border-slate-300 text-right mono w-28 text-red-700" id="tb-total-credit-p">0</td>
                        <td class="py-3 px-1 border-y border-r border-slate-300 text-center mono w-8 text-red-700" id="tb-total-credit-c">00</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
</section>
