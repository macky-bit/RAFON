<?php declare(strict_types=1); ?>
<section id="trial-balance-view" class="hidden report-view">
    <div class="report-card">
        <header class="report-heading">
            <span class="report-eyebrow">Compañero Rafon Resto Grill &amp; Seafoods</span>
            <h2>Trial Balance</h2>
            <p>All recorded journal entries</p>
        </header>

        <div class="report-table-wrap">
            <table class="report-table trial-balance-table">
                <thead>
                    <tr>
                        <th class="report-code-column">Account Code</th>
                        <th>Account Title</th>
                        <th class="report-amount-column">Debit (₱)</th>
                        <th class="report-amount-column">Credit (₱)</th>
                    </tr>
                </thead>
                <tbody id="trial-balance-body"></tbody>
                <tfoot>
                    <tr>
                        <td colspan="2">Total Trial Balance</td>
                        <td id="tb-total-debit" class="report-amount report-positive">₱ 0.00</td>
                        <td id="tb-total-credit" class="report-amount report-negative">₱ 0.00</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <div id="tb-balance-status" class="report-status" role="status">
            <i class="fa-solid fa-check" aria-hidden="true"></i>
            <span><strong id="tb-account-count">0 accounts</strong> · Debits and credits are balanced.</span>
        </div>
    </div>
</section>
