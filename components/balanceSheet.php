<?php declare(strict_types=1); ?>
<section id="balance-sheet-view" class="hidden report-view">
    <div class="report-card">
        <div class="balance-worksheet-scroll" role="region" aria-label="Balance sheet worksheet" tabindex="0">
            <table class="balance-worksheet">
                <caption>Balance Sheet — Accounting Equation</caption>
                <thead id="bs-table-head"></thead>
                <tbody id="bs-transactions"></tbody>
                <tfoot id="bs-table-foot"></tfoot>
            </table>
        </div>
        <div id="bs-balance-status" class="balance-status" role="status" aria-live="polite">
            <i class="fa-solid fa-check" aria-hidden="true"></i><span>Balanced</span>
        </div>
    </div>
</section>
