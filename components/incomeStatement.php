<?php declare(strict_types=1); ?>
<section id="income-statement-view" class="hidden report-view">
    <div class="report-card">
        <header class="report-heading">
            <h2>Compañero Rafon Resto Grill &amp; Seafoods</h2>
            <h3>Income Statement</h3>
            <p>All recorded journal entries</p>
        </header>

        <div class="income-report-grid">
            <section class="statement-panel" aria-labelledby="income-revenue-title">
                <header class="statement-panel-heading">
                    <span class="statement-panel-icon"><i class="fa-solid fa-arrow-trend-up" aria-hidden="true"></i></span>
                    <h4 id="income-revenue-title">Revenues &amp; Sales</h4>
                </header>
                <div class="statement-panel-body"><div id="is-revenues-list" class="report-list"></div></div>
                <footer class="statement-total">
                    <span>Total Operating Revenue</span>
                    <strong id="is-total-revenue" class="mono report-positive">₱ 0.00</strong>
                </footer>
            </section>

            <section class="statement-panel" aria-labelledby="income-expense-title">
                <header class="statement-panel-heading">
                    <span class="statement-panel-icon"><i class="fa-regular fa-file-lines" aria-hidden="true"></i></span>
                    <h4 id="income-expense-title">Operating Expenses</h4>
                </header>
                <div class="statement-panel-body"><div id="is-expenses-list" class="report-list"></div></div>
                <footer class="statement-total">
                    <span>Total Operating Expenses</span>
                    <strong id="is-total-expenses" class="mono report-negative">₱ 0.00</strong>
                </footer>
            </section>
        </div>

        <div id="income-net-summary" class="income-net-summary">
            <span class="income-net-icon"><i id="income-net-icon" class="fa-solid fa-arrow-trend-up" aria-hidden="true"></i></span>
            <div><h4 id="is-net-title">Net Profit / Income</h4><p>Included in the equity summary</p></div>
            <strong id="is-net-amount" class="income-net-amount mono">₱ 0.00</strong>
        </div>
    </div>
</section>
