<?php declare(strict_types=1); ?>
<section id="balance-sheet-view" class="hidden report-view">
    <div class="report-card">
        <header class="report-heading">
            <h2>Compañero Rafon Resto Grill &amp; Seafoods</h2>
            <h3>Balance Sheet</h3>
            <p>Based on all recorded journal entries</p>
        </header>

        <div class="balance-report-grid">
            <section class="balance-column balance-assets" aria-labelledby="balance-assets-title">
                <h4 id="balance-assets-title">Assets</h4>
                <div id="bs-assets-list" class="report-list"></div>
                <footer class="balance-subtotal"><span>Total Assets</span><strong id="bs-total-assets" class="mono">₱ 0.00</strong></footer>
            </section>

            <div class="balance-column-stack">
                <section class="balance-column balance-liabilities" aria-labelledby="balance-liabilities-title">
                    <h4 id="balance-liabilities-title">Liabilities</h4>
                    <div id="bs-liabilities-list" class="report-list"></div>
                    <footer class="balance-subtotal"><span>Total Liabilities</span><strong id="bs-total-liabilities" class="mono">₱ 0.00</strong></footer>
                </section>

                <section class="balance-column balance-equity" aria-labelledby="balance-equity-title">
                    <h4 id="balance-equity-title">Owner's Equity</h4>
                    <div id="bs-equity-list" class="report-list"></div>
                    <footer class="balance-subtotal"><span>Total Equity</span><strong id="bs-total-equity" class="mono">₱ 0.00</strong></footer>
                </section>
            </div>
        </div>

        <div class="balance-summary">
            <div><span>Total Assets</span><strong id="bs-summary-assets" class="mono">₱ 0.00</strong></div>
            <div id="bs-balance-status" class="balance-status" role="status"><i class="fa-solid fa-check" aria-hidden="true"></i><span>Balanced</span></div>
            <div><span>Total Liabilities &amp; Equity</span><strong id="bs-total-liab-equity" class="mono">₱ 0.00</strong></div>
        </div>
    </div>
</section>
