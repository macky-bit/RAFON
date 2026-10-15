<?php declare(strict_types=1); ?>
<section id="journal-view" class="hidden journal-view">
    <div class="journal-book">
        <div class="journal-toolbar">
            <div>
                <span class="eyebrow">Book of original entry</span>
                <h2>General Journal</h2>
                <p>Transactions recorded in standard split peso and cent format.</p>
            </div>
            <div>
                <button type="button" id="print-journal-button" class="journal-print-button">
                    <i class="fa-solid fa-print" aria-hidden="true"></i>
                    <span>Print Journal</span>
                </button>
            </div>
        </div>

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
                    </tr>
                </thead>
                <tbody id="journal-table-body">
                    <!-- JS Injected Content with split peso & cents columns -->
                </tbody>
            </table>
        </div>
    </div>
</section>
