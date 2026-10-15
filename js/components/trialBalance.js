/* Trial Balance */
import { loadTemplate } from '../loader.js';import { chartOfAccounts, journalEntries } from '../state.js';
import { formatPHP } from '../utils.js';

export async function mount(parent) {
    parent.insertAdjacentHTML('beforeend', await loadTemplate('trialBalance'));
}

// 3. Render Trial Balance Summary
export function render() {
    const tbody = document.getElementById('trial-balance-body');
    tbody.innerHTML = '';

    let grandTotalDebit = 0;
    let grandTotalCredit = 0;
    let accountCount = 0;

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
        accountCount += 1;

        const row = document.createElement('tr');
        row.className = 'report-table-row';
        row.innerHTML = `
            <td class="report-code mono">${acc.code}</td>
            <td class="report-account">${acc.title}</td>
            <td class="report-amount mono">${debitBal > 0 ? formatPHP(debitBal) : '—'}</td>
            <td class="report-amount mono">${creditBal > 0 ? formatPHP(creditBal) : '—'}</td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById('tb-total-debit').innerText = formatPHP(grandTotalDebit);
    document.getElementById('tb-total-credit').innerText = formatPHP(grandTotalCredit);
    document.getElementById('tb-account-count').innerText = `${accountCount} account${accountCount === 1 ? '' : 's'}`;

    const status = document.getElementById('tb-balance-status');
    const isBalanced = Math.abs(grandTotalDebit - grandTotalCredit) < 0.005;
    status.classList.toggle('is-unbalanced', !isBalanced);
    status.querySelector('i').className = `fa-solid ${isBalanced ? 'fa-check' : 'fa-triangle-exclamation'}`;
    status.querySelector('span').lastChild.textContent = isBalanced
        ? ' · Debits and credits are balanced.'
        : ' · Debits and credits do not balance.';

    if (!accountCount) tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No posted balances yet. Record a transaction to build your trial balance.</td></tr>';

}
