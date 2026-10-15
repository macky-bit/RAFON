<?php declare(strict_types=1); ?>
<section id="dashboard-view" class="hidden space-y-6 dashboard-shell">
    <div class="section-intro">
        <div>
            <span class="eyebrow">Financial overview</span>
            <h2>See what the business earns, spends, and keeps.</h2>
            <p>Live accounting totals and user-entered catering performance in one focused workspace.</p>
        </div>
        <div class="period-chip"><i class="fa-regular fa-calendar"></i> All recorded entries</div>
    </div>
    <!-- Summary Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Metric 1: Total Revenue -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div class="flex justify-between items-start">
                <div>
                    <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Revenue</p>
                    <h3 id="dash-revenue" class="text-2xl font-bold text-slate-900 mono mt-2">₱ 0.00</h3>
                </div>
                <div class="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                    <i class="fa-solid fa-arrow-trend-up text-xl"></i>
                </div>
            </div>
            <p class="text-xs text-emerald-600 mt-3 font-medium flex items-center">
                <i class="fa-solid fa-book text-[10px] mr-1"></i> Recorded revenue
            </p>
        </div>

        <!-- Metric 2: Total Expenses -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div class="flex justify-between items-start">
                <div>
                    <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Expenses</p>
                    <h3 id="dash-expenses" class="text-2xl font-bold text-slate-900 mono mt-2">₱ 0.00</h3>
                </div>
                <div class="p-3 bg-red-50 rounded-xl text-red-600">
                    <i class="fa-solid fa-receipt text-xl"></i>
                </div>
            </div>
            <p class="text-xs text-slate-500 mt-3 font-medium">Recorded expenses</p>
        </div>

        <!-- Metric 3: Outstanding Receivables -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div class="flex justify-between items-start">
                <div>
                    <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Outstanding Receivables</p>
                    <h3 id="dash-receivables" class="text-2xl font-bold text-slate-900 mono mt-2">₱ 0.00</h3>
                </div>
                <div class="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <i class="fa-solid fa-file-invoice text-xl"></i>
                </div>
            </div>
            <p class="text-xs text-slate-500 mt-3 font-medium">Current customer balance</p>
        </div>

        <!-- Metric 4: Net Revenue/Profit -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div class="flex justify-between items-start">
                <div>
                    <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Net Profit / (Loss)</p>
                    <h3 id="dash-net-income" class="text-2xl font-bold text-slate-900 mono mt-2">₱ 0.00</h3>
                </div>
                <div class="p-3 bg-amber-50 rounded-xl text-amber-600">
                    <i class="fa-solid fa-coins text-xl"></i>
                </div>
            </div>
            <p id="dash-net-income-sub" class="text-xs font-medium mt-3 text-emerald-600">Revenue less expenses</p>
        </div>
    </div>

    <!-- Cash Flow and Balances -->
    <section class="cash-flow-panel" aria-labelledby="cash-flow-title">
        <div class="cash-flow-copy">
            <span class="dashboard-index">02</span>
            <span class="eyebrow">Liquidity</span>
            <h2 id="cash-flow-title">Cash flow and balances</h2>
            <p>Follow movement through the Cash on Hand &amp; Bank account.</p>
        </div>
        <dl class="cash-flow-stats">
            <div><dt>Cash and bank balance</dt><dd id="dash-cash-balance" class="mono">₱ 0.00</dd></div>
            <div><dt>Money received</dt><dd id="dash-cash-received" class="mono">₱ 0.00</dd></div>
            <div><dt>Money paid</dt><dd id="dash-cash-paid" class="mono">₱ 0.00</dd></div>
            <div class="cash-flow-net"><dt>Net cash flow</dt><dd id="dash-net-cash" class="mono">₱ 0.00</dd></div>
        </dl>
    </section>

    <!-- Catering Sales and Event Revenue -->
    <section class="dashboard-section" aria-labelledby="catering-performance-title">
        <div class="dashboard-section-heading">
            <div>
                <span class="dashboard-index">03</span>
                <div><h2 id="catering-performance-title">Catering sales and event revenue</h2><p>Entered and maintained by system users.</p></div>
            </div>
            <button type="button" id="add-catering-event" class="dashboard-primary-button"><i class="fa-solid fa-plus"></i> Add catering event</button>
        </div>
        <div class="catering-stat-grid">
            <article><span>Events this month</span><strong id="event-month-count">0</strong></article>
            <article><span>Recorded event revenue</span><strong id="event-total-revenue" class="mono">₱ 0.00</strong></article>
            <article><span>Upcoming unpaid balance</span><strong id="event-unpaid-balance" class="mono">₱ 0.00</strong></article>
            <article><span>Most profitable package</span><strong id="event-top-package">No data yet</strong></article>
        </div>
        <div class="dashboard-table-wrap">
            <table class="dashboard-table">
                <thead><tr><th>Event</th><th>Date</th><th>Package</th><th>Status</th><th class="amount-column">Revenue</th><th class="amount-column">Profit</th><th><span class="sr-only">Actions</span></th></tr></thead>
                <tbody id="catering-events-table"></tbody>
            </table>
        </div>
    </section>

    <!-- Expense Breakdown -->
    <section class="dashboard-section expense-section" aria-labelledby="expense-breakdown-title">
        <div class="dashboard-section-heading">
            <div>
                <span class="dashboard-index">05</span>
                <div><h2 id="expense-breakdown-title">Expense breakdown</h2><p>Posted expenses grouped by ledger account.</p></div>
            </div>
        </div>
        <div id="expense-breakdown" class="expense-breakdown" role="list"></div>
    </section>

    <!-- Recent Transactions Panel -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div class="flex justify-between items-center mb-4">
            <div>
                <h2 class="text-lg font-bold text-slate-800">Recent Accounting Activities</h2>
                <p class="text-xs text-slate-500">Latest posted double-entry journal items</p>
            </div>
            <button data-tab="journal" class="text-emerald-600 hover:text-emerald-700 font-semibold text-xs flex items-center">
                View Full Journal <i class="fa-solid fa-chevron-right ml-1 text-[10px]"></i>
            </button>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-600">
                <thead class="bg-slate-50 text-slate-700 uppercase text-[11px] font-semibold border-y border-slate-200">
                    <tr>
                        <th class="py-3 px-4">Date</th>
                        <th class="py-3 px-4">Particulars</th>
                        <th class="py-3 px-4">Ref</th>
                        <th class="py-3 px-4 text-right">Debit</th>
                        <th class="py-3 px-4 text-right">Credit</th>
                    </tr>
                </thead>
                <tbody id="dash-recent-table" class="divide-y divide-slate-100">
                    <!-- Populated dynamically by JS -->
                </tbody>
            </table>
        </div>
    </div>

    <dialog id="catering-event-modal" aria-labelledby="catering-event-modal-title">
        <div class="event-modal-card">
            <div class="event-modal-header">
                <div><span class="eyebrow">User-entered record</span><h2 id="catering-event-modal-title">Add catering event</h2></div>
                <button type="button" class="js-close-event-modal" aria-label="Close catering event form"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form id="catering-event-form">
                <input type="hidden" id="event-id">
                <p id="catering-event-error" class="form-error hidden" role="alert"></p>
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
                <div class="event-form-actions">
                    <button type="button" class="js-close-event-modal dashboard-secondary-button">Cancel</button>
                    <button type="submit" class="dashboard-primary-button">Save event</button>
                </div>
            </form>
        </div>
    </dialog>
</section>
