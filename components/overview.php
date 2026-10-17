<?php declare(strict_types=1); ?>
<section id="dashboard-view" class="hidden dashboard-shell">
    <div class="dashboard-kpis" aria-label="Financial summary">
        <article class="kpi-card kpi-revenue">
            <span class="kpi-icon"><i class="fa-solid fa-chart-column" aria-hidden="true"></i></span>
            <div><p>Total revenue</p><strong id="dash-revenue" class="mono">₱ 0.00</strong><small><i class="fa-solid fa-arrow-trend-up" aria-hidden="true"></i> Recorded revenue</small></div>
        </article>
        <article class="kpi-card kpi-expenses">
            <span class="kpi-icon"><i class="fa-solid fa-receipt" aria-hidden="true"></i></span>
            <div><p>Total expenses</p><strong id="dash-expenses" class="mono">₱ 0.00</strong><small><i class="fa-solid fa-arrow-trend-down" aria-hidden="true"></i> Recorded expenses</small></div>
        </article>
        <article class="kpi-card kpi-receivables">
            <span class="kpi-icon"><i class="fa-solid fa-file-invoice" aria-hidden="true"></i></span>
            <div><p>Outstanding receivables</p><strong id="dash-receivables" class="mono">₱ 0.00</strong><small><i class="fa-regular fa-clock" aria-hidden="true"></i> Current customer balance</small></div>
        </article>
        <article class="kpi-card kpi-profit">
            <span class="kpi-icon"><i class="fa-solid fa-coins" aria-hidden="true"></i></span>
            <div><p>Net profit / (loss)</p><strong id="dash-net-income" class="mono">₱ 0.00</strong><small id="dash-net-income-sub">Revenue less expenses</small></div>
        </article>
    </div>

    <div class="dashboard-feature-grid">
        <section class="performance-panel" aria-labelledby="performance-title">
            <div class="panel-heading">
                <span class="panel-icon"><i class="fa-solid fa-chart-column" aria-hidden="true"></i></span>
                <div><h2 id="performance-title">Revenue vs. Expenses</h2><p>Monthly performance from posted entries.</p></div>
                <div class="chart-legend" aria-hidden="true"><span><i class="revenue-dot"></i>Revenue</span><span><i class="expense-dot"></i>Expenses</span></div>
            </div>
            <div id="performance-chart" class="performance-chart" role="group" aria-label="Revenue and expenses for the last six months"></div>
        </section>

        <section class="cash-flow-panel" aria-labelledby="cash-flow-title">
            <div class="panel-heading cash-heading">
                <span class="panel-icon"><i class="fa-solid fa-building-columns" aria-hidden="true"></i></span>
                <div><h2 id="cash-flow-title">Cash Flow Snapshot</h2><p>Movement through Cash on Hand &amp; Bank.</p></div>
            </div>
            <dl class="cash-flow-stats">
                <div><dt><i class="fa-solid fa-wallet" aria-hidden="true"></i><span>Cash &amp; Bank Balance</span></dt><dd id="dash-cash-balance" class="mono">₱ 0.00</dd></div>
                <div><dt><i class="fa-solid fa-arrow-down" aria-hidden="true"></i><span>Money Paid</span></dt><dd id="dash-cash-paid" class="mono">₱ 0.00</dd></div>
                <div><dt><i class="fa-solid fa-arrow-up" aria-hidden="true"></i><span>Money Received</span></dt><dd id="dash-cash-received" class="mono">₱ 0.00</dd></div>
                <div class="cash-flow-net"><dt><i class="fa-solid fa-chart-simple" aria-hidden="true"></i><span>Net Cash Flow</span></dt><dd id="dash-net-cash" class="mono">₱ 0.00</dd></div>
            </dl>
        </section>
    </div>

    <div class="dashboard-lower-grid">
        <section class="dashboard-section catering-panel" aria-labelledby="catering-performance-title">
            <div class="panel-heading">
                <span class="panel-icon"><i class="fa-solid fa-utensils" aria-hidden="true"></i></span>
                <div><h2 id="catering-performance-title">Catering &amp; Events</h2><p>Event bookings, revenue, and upcoming schedules.</p></div>
                <button type="button" id="add-catering-event" class="dashboard-primary-button"><i class="fa-solid fa-plus" aria-hidden="true"></i> Add Event</button>
            </div>
            <div class="catering-content">
                <div class="catering-stat-grid">
                    <article><i class="fa-regular fa-calendar-check" aria-hidden="true"></i><strong id="event-month-count">0</strong><span>Events this month</span></article>
                    <article><i class="fa-solid fa-coins" aria-hidden="true"></i><strong id="event-total-revenue" class="mono">₱ 0.00</strong><span>Recorded revenue</span></article>
                    <article><i class="fa-regular fa-clock" aria-hidden="true"></i><strong id="event-unpaid-balance" class="mono">₱ 0.00</strong><span>Upcoming balance</span></article>
                    <article class="top-package"><i class="fa-solid fa-award" aria-hidden="true"></i><strong id="event-top-package">No data yet</strong><span>Top package</span></article>
                </div>
                <div class="dashboard-table-wrap event-table-wrap">
                    <table class="dashboard-table event-table">
                        <thead><tr><th>Upcoming Event</th><th>Date</th><th>Status</th><th class="amount-column">Revenue</th><th>Actions</th></tr></thead>
                        <tbody id="catering-events-table"></tbody>
                    </table>
                </div>
            </div>
        </section>

        <section class="dashboard-section recent-panel" aria-labelledby="recent-title">
            <div class="panel-heading">
                <span class="panel-icon"><i class="fa-solid fa-file-invoice" aria-hidden="true"></i></span>
                <div><h2 id="recent-title">Recent Transactions</h2><p>Latest accounting entries across all books.</p></div>
                <button data-tab="journal" class="panel-link">View all <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>
            </div>
            <div class="dashboard-table-wrap recent-table-wrap">
                <table class="dashboard-table recent-table">
                    <thead><tr><th>Date</th><th>Description</th><th>Ref</th><th class="amount-column">Debit</th><th class="amount-column">Credit</th></tr></thead>
                    <tbody id="dash-recent-table"></tbody>
                </table>
            </div>
        </section>
    </div>

    <div class="dashboard-faq">
        <section id="dashboard-faq-panel" class="dashboard-faq-panel" aria-labelledby="dashboard-faq-title" hidden>
            <div class="dashboard-faq-heading">
                <h2 id="dashboard-faq-title">Dashboard FAQ</h2>
                <button type="button" id="dashboard-faq-close" aria-label="Close dashboard FAQ"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
            </div>
            <div class="dashboard-faq-questions">
                <details><summary>Where do the financial totals come from?</summary><p>They are calculated from posted General Journal entries. The dashboard updates when entries are added, edited, or removed.</p></details>
                <details><summary>How is net profit calculated?</summary><p>Net profit is recorded revenue minus recorded expenses.</p></details>
                <details><summary>What is the upcoming balance?</summary><p>It is the unpaid amount for catering events still marked Upcoming. Past events automatically become Completed.</p></details>
                <details><summary>Where can I review transactions?</summary><p>Open Accounting, then General Journal, to see all posted entries.</p></details>
            </div>
        </section>
        <button type="button" id="dashboard-faq-toggle" class="dashboard-faq-toggle" aria-controls="dashboard-faq-panel" aria-expanded="false"><i class="fa-regular fa-circle-question" aria-hidden="true"></i><span>FAQ</span></button>
    </div>

    <dialog id="catering-event-modal" aria-labelledby="catering-event-modal-title">
        <div class="event-modal-card">
            <div class="event-modal-header"><div><span class="eyebrow">Event record</span><h2 id="catering-event-modal-title">Add catering event</h2></div><button type="button" class="js-close-event-modal" aria-label="Close catering event form"><i class="fa-solid fa-xmark"></i></button></div>
            <form id="catering-event-form">
                <input type="hidden" id="event-id"><p id="catering-event-error" class="form-error hidden" role="alert"></p>
                <div class="event-form-grid">
                    <div class="event-form-field event-form-wide"><label for="event-name">Event name</label><input id="event-name" maxlength="150" required placeholder="e.g. Santos wedding reception"></div>
                    <div class="event-form-field"><label for="event-client">Client name</label><input id="event-client" maxlength="150" required></div>
                    <div class="event-form-field"><label for="event-package">Package name</label><input id="event-package" maxlength="120" required placeholder="e.g. Premium buffet"></div>
                    <div class="event-form-field"><label for="event-date">Event date</label><input type="date" id="event-date" required></div>
                    <div class="event-form-field"><label for="event-status">Status</label><select id="event-status"><option>Upcoming</option><option>Completed</option><option>Cancelled</option></select></div>
                    <div class="event-form-field"><label for="event-revenue">Agreed revenue (PHP)</label><input type="number" id="event-revenue" min="0" step="0.01" required value="0"></div>
                    <div class="event-form-field"><label for="event-cost">Estimated cost (PHP)</label><input type="number" id="event-cost" min="0" step="0.01" required value="0"></div>
                    <div class="event-form-field"><label for="event-paid">Amount paid (PHP)</label><input type="number" id="event-paid" min="0" step="0.01" required value="0"></div>
                    <div class="event-form-field event-form-wide"><label for="event-notes">Notes <span>(optional)</span></label><textarea id="event-notes" maxlength="500" rows="3"></textarea></div>
                </div>
                <div class="event-form-actions"><button type="button" class="js-close-event-modal dashboard-secondary-button">Cancel</button><button type="submit" class="dashboard-primary-button">Save event</button></div>
            </form>
        </div>
    </dialog>
</section>
