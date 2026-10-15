/* Balance Sheet */
import { loadTemplate } from '../loader.js';import { chartOfAccounts, journalEntries } from '../state.js';
import { formatPHP } from '../utils.js';

export async function mount(parent) {
    parent.insertAdjacentHTML('beforeend', await loadTemplate('balanceSheet'));
}

// 5. Render Balance Sheet
export function render() {
    const assetList = document.getElementById('bs-assets-list');
    const liabList = document.getElementById('bs-liabilities-list');
    const equityList = document.getElementById('bs-equity-list');

    assetList.innerHTML = '';
    liabList.innerHTML = '';
    equityList.innerHTML = '';

    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;

    // Compute Net Income to roll into Retained Equity
    let totalRevenue = 0;
    let totalExpense = 0;

    chartOfAccounts.forEach(acc => {
        let dr = 0, cr = 0;
        journalEntries.forEach(e => {
            if (e.debitAcc === acc.title) dr += e.debitAmount;
            if (e.creditAcc === acc.title) cr += e.creditAmount;
        });

        if (acc.category === 'Revenue') totalRevenue += (cr - dr);
        if (acc.category === 'Expense') totalExpense += (dr - cr);
    });

    const netIncome = totalRevenue - totalExpense;

    chartOfAccounts.forEach(acc => {
        let dr = 0, cr = 0;
        journalEntries.forEach(e => {
            if (e.debitAcc === acc.title) dr += e.debitAmount;
            if (e.creditAcc === acc.title) cr += e.creditAmount;
        });

        if (acc.category === 'Asset') {
            const balance = dr - cr;
            if (balance !== 0) {
                totalAssets += balance;
                assetList.innerHTML += `
                    <div class="flex justify-between items-center text-slate-600">
                        <span>${acc.title}</span>
                        <span class="mono">${formatPHP(balance)}</span>
                    </div>
                `;
            }
        } else if (acc.category === 'Liability') {
            const balance = cr - dr;
            if (balance !== 0) {
                totalLiabilities += balance;
                liabList.innerHTML += `
                    <div class="flex justify-between items-center text-slate-600">
                        <span>${acc.title}</span>
                        <span class="mono">${formatPHP(balance)}</span>
                    </div>
                `;
            }
        } else if (acc.category === 'Equity') {
            const balance = cr - dr;
            if (balance !== 0) {
                totalEquity += balance;
                equityList.innerHTML += `
                    <div class="flex justify-between items-center text-slate-600">
                        <span>${acc.title}</span>
                        <span class="mono">${formatPHP(balance)}</span>
                    </div>
                `;
            }
        }
    });

    // Append Retained Earnings / Net income from recorded entries to Equity
    if (netIncome !== 0) {
        totalEquity += netIncome;
        equityList.innerHTML += `
            <div class="flex justify-between items-center text-emerald-700 font-medium">
                <span>Net income from recorded entries</span>
                <span class="mono">${formatPHP(netIncome)}</span>
            </div>
        `;
    }

    document.getElementById('bs-total-assets').innerText = formatPHP(totalAssets);
    document.getElementById('bs-total-liabilities').innerText = formatPHP(totalLiabilities);
    document.getElementById('bs-total-equity').innerText = formatPHP(totalEquity);
    document.getElementById('bs-total-liab-equity').innerText = formatPHP(totalLiabilities + totalEquity);
    for (const list of [assetList, liabList, equityList]) {
        if (!list.children.length) list.innerHTML = '<p class="text-slate-500">No balances recorded.</p>';
    }

}
