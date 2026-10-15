/* Trial Balance */
import { loadTemplate } from '../loader.js';import { chartOfAccounts, journalEntries } from '../state.js';
import { splitAmount } from '../utils.js';

export async function mount(parent) {
    parent.insertAdjacentHTML('beforeend', await loadTemplate('trialBalance'));
}

// 3. Render Trial Balance Summary
export function render() {
    const tbody = document.getElementById('trial-balance-body');
    tbody.innerHTML = '';

    let grandTotalDebit = 0;
    let grandTotalCredit = 0;

    chartOfAccounts.forEach(acc => {
        let totalDebits = 0;
        let totalCredits = 0;

        journalEntries.forEach(e => {
            if (e.debitAcc === acc.title) totalDebits += e.debitAmount;
            if (e.creditAcc === acc.title) totalCredits += e.creditAmount;
        });

        let debitBal = 0;
        let creditBal = 0;

        if (acc.normal === 'Debit') {
            const diff = totalDebits - totalCredits;
            if (diff > 0) debitBal = diff;
            else creditBal = Math.abs(diff);
        } else {
            const diff = totalCredits - totalDebits;
            if (diff > 0) creditBal = diff;
            else debitBal = Math.abs(diff);
        }

        if (debitBal === 0 && creditBal === 0) return;

        grandTotalDebit += debitBal;
        grandTotalCredit += creditBal;

        const drSplit = debitBal > 0 ? splitAmount(debitBal) : { pesos: '', cents: '' };
        const crSplit = creditBal > 0 ? splitAmount(creditBal) : { pesos: '', cents: '' };

        const row = document.createElement('tr');
        row.className = "hover:bg-slate-50 text-xs";
        row.innerHTML = `
            <td class="py-2.5 px-4 border border-slate-300 font-medium text-slate-800">${acc.title} <span class="text-[10px] text-slate-400 font-mono">(${acc.code})</span></td>
            <td class="py-2.5 px-2 border-y border-l border-slate-300 text-right mono w-28 text-slate-800">${drSplit.pesos}</td>
            <td class="py-2.5 px-1 border-y border-r border-slate-300 text-center mono w-8 text-slate-500 border-split">${drSplit.cents}</td>
            <td class="py-2.5 px-2 border-y border-l border-slate-300 text-right mono w-28 text-slate-800">${crSplit.pesos}</td>
            <td class="py-2.5 px-1 border-y border-r border-slate-300 text-center mono w-8 text-slate-500">${crSplit.cents}</td>
        `;
        tbody.appendChild(row);
    });

    // Update Total Balances
    const totalDr = splitAmount(grandTotalDebit);
    const totalCr = splitAmount(grandTotalCredit);

    document.getElementById('tb-total-debit-p').innerText = totalDr.pesos;
    document.getElementById('tb-total-debit-c').innerText = totalDr.cents;
    document.getElementById('tb-total-credit-p').innerText = totalCr.pesos;
    document.getElementById('tb-total-credit-c').innerText = totalCr.cents;
    if (!tbody.children.length) tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No posted balances yet. Record a transaction to build your trial balance.</td></tr>';

}
