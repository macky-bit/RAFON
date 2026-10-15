/* General Ledger (T-Accounts) */
import { loadTemplate } from '../loader.js';import { chartOfAccounts, journalEntries } from '../state.js';
import { formatPHP } from '../utils.js';

export async function mount(parent) {
    parent.insertAdjacentHTML('beforeend', await loadTemplate('ledger'));
}

// Fill the account filter once (original logic: skip options that already exist)
export function populateFilter() {
    const ledgerFilter = document.getElementById('ledger-filter');
    chartOfAccounts.forEach(acc => {
        if (!Array.from(ledgerFilter.options).some(o => o.value === acc.title)) {
            ledgerFilter.innerHTML += `<option value="${acc.title}">${acc.code} - ${acc.title}</option>`;
        }
    });
}

export function bindEvents() {
    document.getElementById('ledger-filter').addEventListener('change', render);
}

// 2. Render T-Accounts General Ledger
export function render() {
    const container = document.getElementById('ledger-accounts-container');
    const filterValue = document.getElementById('ledger-filter').value;
    container.innerHTML = '';

    chartOfAccounts.forEach(acc => {
        if (filterValue !== 'ALL' && acc.title !== filterValue) return;

        // Find all postings for this specific account
        let debitPostings = [];
        let creditPostings = [];
        let totalDebits = 0;
        let totalCredits = 0;

        journalEntries.forEach(e => {
            if (e.debitAcc === acc.title) {
                debitPostings.push({ date: e.date, ref: e.ref, amount: e.debitAmount });
                totalDebits += e.debitAmount;
            }
            if (e.creditAcc === acc.title) {
                creditPostings.push({ date: e.date, ref: e.ref, amount: e.creditAmount });
                totalCredits += e.creditAmount;
            }
        });

        // Skip displaying unposted accounts if filtered ALL
        if (filterValue === 'ALL' && debitPostings.length === 0 && creditPostings.length === 0) return;

        // Calculate Net Balance according to Normal Account Balance Rules
        let balanceText = "";
        let netBal = 0;
        if (acc.normal === 'Debit') {
            netBal = totalDebits - totalCredits;
            balanceText = `Bal Dr: ${formatPHP(netBal)}`;
        } else {
            netBal = totalCredits - totalDebits;
            balanceText = `Bal Cr: ${formatPHP(netBal)}`;
        }

        // Create Classic T-Account Box
        const accountBox = document.createElement('div');
        accountBox.className = "bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden";
        accountBox.innerHTML = `
            <!-- Gold / Slate Classic Header -->
            <div class="bg-amber-600 text-white px-4 py-3 flex justify-between items-center">
                <div class="flex items-center space-x-2">
                    <span class="bg-amber-800 text-amber-200 text-xs px-2 py-0.5 rounded font-mono">${acc.code}</span>
                    <h3 class="font-bold text-sm tracking-wide uppercase">${acc.title}</h3>
                </div>
                <span class="text-xs font-semibold bg-amber-700/80 px-2.5 py-1 rounded">${balanceText}</span>
            </div>

            <!-- T-Account Layout Split Grid -->
            <div class="grid grid-cols-2 divide-x divide-slate-400">
                <!-- DEBIT SIDE -->
                <div class="p-3">
                    <div class="text-[11px] font-bold text-emerald-700 uppercase border-b border-slate-200 pb-1 mb-2 flex justify-between">
                        <span>Debit (Dr.)</span>
                        <span>₱</span>
                    </div>
                    <div class="space-y-1.5 text-xs">
                        ${debitPostings.map(p => `
                            <div class="flex justify-between items-center text-slate-700">
                                <span class="text-[10px] text-slate-400">${p.date} <span class="font-mono text-slate-500">(${p.ref})</span></span>
                                <span class="mono font-medium">${p.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- CREDIT SIDE -->
                <div class="p-3 bg-slate-50/40">
                    <div class="text-[11px] font-bold text-red-700 uppercase border-b border-slate-200 pb-1 mb-2 flex justify-between">
                        <span>Credit (Cr.)</span>
                        <span>₱</span>
                    </div>
                    <div class="space-y-1.5 text-xs">
                        ${creditPostings.map(p => `
                            <div class="flex justify-between items-center text-slate-700">
                                <span class="text-[10px] text-slate-400">${p.date} <span class="font-mono text-slate-500">(${p.ref})</span></span>
                                <span class="mono font-medium">${p.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        container.appendChild(accountBox);
    });
    if (!container.children.length) container.innerHTML = '<p class="empty-state">No postings for these accounts yet. Use Post Entry to get started.</p>';

}
