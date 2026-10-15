/* Income Statement */
import { loadTemplate } from '../loader.js';import { chartOfAccounts, journalEntries } from '../state.js';
import { formatPHP } from '../utils.js';

export async function mount(parent) {
    parent.insertAdjacentHTML('beforeend', await loadTemplate('incomeStatement'));
}

// 4. Render Income Statement
export function render() {
    const revList = document.getElementById('is-revenues-list');
    const expList = document.getElementById('is-expenses-list');

    revList.innerHTML = '';
    expList.innerHTML = '';

    let totalRevenue = 0;
    let totalExpense = 0;

    chartOfAccounts.forEach(acc => {
        let totalDebits = 0;
        let totalCredits = 0;

        journalEntries.forEach(e => {
            if (e.debitAcc === acc.title) totalDebits += e.debitAmount;
            if (e.creditAcc === acc.title) totalCredits += e.creditAmount;
        });

        if (acc.category === 'Revenue') {
            const balance = totalCredits - totalDebits;
            if (balance !== 0) {
                totalRevenue += balance;
                revList.innerHTML += `
                    <div class="report-line">
                        <span>${acc.title}</span>
                        <span class="mono">${formatPHP(balance)}</span>
                    </div>
                `;
            }
        } else if (acc.category === 'Expense') {
            const balance = totalDebits - totalCredits;
            if (balance !== 0) {
                totalExpense += balance;
                expList.innerHTML += `
                    <div class="report-line">
                        <span>${acc.title}</span>
                        <span class="mono">${formatPHP(balance)}</span>
                    </div>
                `;
            }
        }
    });

    const netIncome = totalRevenue - totalExpense;

    document.getElementById('is-total-revenue').innerText = formatPHP(totalRevenue);
    document.getElementById('is-total-expenses').innerText = formatPHP(totalExpense);

    const netAmountEl = document.getElementById('is-net-amount');
    const netTitleEl = document.getElementById('is-net-title');
    const netSummaryEl = document.getElementById('income-net-summary');
    const netIconEl = document.getElementById('income-net-icon');
    const isLoss = netIncome < 0;

    netTitleEl.innerText = isLoss ? 'Net Operating Loss' : 'Net Profit / Income';
    netAmountEl.innerText = formatPHP(netIncome);
    netSummaryEl.classList.toggle('is-loss', isLoss);
    netIconEl.className = `fa-solid ${isLoss ? 'fa-arrow-trend-down' : 'fa-arrow-trend-up'}`;

    if (!revList.children.length) revList.innerHTML = '<p class="report-empty">No revenue balances recorded.</p>';
    if (!expList.children.length) expList.innerHTML = '<p class="report-empty">No expense balances recorded.</p>';

}
