/* General Ledger: chronological postings with a running balance. */
import { loadTemplate } from '../loader.js';
import { chartOfAccounts, deleteEntry, journalEntries } from '../state.js';
import { entryLines, escapeHTML, journalNumberForDate, populateYearFilter } from '../utils.js';
import { confirmAction } from '../confirmAction.js';

const money = amount => Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const displayDay = date => {
    const [, month, day] = String(date).split('-');
    const monthName = monthNames[Number(month) - 1];
    return monthName && day ? String(Number(day)) : String(date);
};

export async function mount(parent) {
    parent.insertAdjacentHTML('beforeend', await loadTemplate('ledger'));
}

export function populateFilter() {
    const filter = document.getElementById('ledger-filter');
    const selected = filter.value;
    filter.innerHTML = '<option value="ALL">All Ledger Accounts</option>' + chartOfAccounts.map(account =>
        `<option value="${escapeHTML(account.code)}">${escapeHTML(account.code)} - ${escapeHTML(account.title)}</option>`
    ).join('');
    if ([...filter.options].some(option => option.value === selected)) filter.value = selected;
    populateYearFilter(document.getElementById('ledger-year-filter'), journalEntries);
}

export function bindEvents() {
    document.getElementById('ledger-filter').addEventListener('change', render);
    document.getElementById('ledger-year-filter').addEventListener('change', render);
    document.getElementById('ledger-accounts-container').addEventListener('click', async event => {
        const button = event.target.closest('[data-ledger-action="delete"]');
        if (!button) return;
        const entry = journalEntries.find(item => item.id === Number(button.dataset.id));
        if (!entry) return;
        if (!await confirmAction({ title: 'Delete journal entry?', message: `Entry ${entry.ref} and all its ledger postings will be removed from financial reports. You can restore it from Backup & Recovery.`, trigger: button })) return;
        button.disabled = true;
        const feedback = document.getElementById('ledger-feedback');
        try {
            await deleteEntry(entry.id);
            feedback.textContent = `Journal entry ${entry.ref} was deleted. All of its ledger postings were removed.`;
            feedback.setAttribute('role', 'status');
            feedback.classList.remove('is-error', 'hidden');
            document.getElementById('ledger-filter').focus();
        } catch (error) {
            feedback.textContent = `Could not delete journal entry ${entry.ref}: ${error.message}`;
            feedback.setAttribute('role', 'alert');
            feedback.classList.add('is-error');
            feedback.classList.remove('hidden');
            button.disabled = false;
        }
    });
}

function postingsFor(account) {
    const postings = [];
    for (const entry of journalEntries) {
        entryLines(entry).forEach((line, order) => {
            if (String(line.accountCode) === String(account.code)) postings.push({ entry, order, side: line.type.toLowerCase(), amount: Number(line.amount), particular: entry.title || entry.explanation || entry.ref });
        });
    }
    return postings.sort((a, b) => a.entry.date.localeCompare(b.entry.date) || a.entry.id - b.entry.id || a.order - b.order);
}

function accountTable(account, postings, year) {
    let balance = 0;
    let previousMonth = null;
    let previousDate = null;
    const rows = postings.map(posting => {
        balance += (posting.side === 'debit' ? 1 : -1) * posting.amount;
        const balanceSide = balance < 0 ? 'Cr' : 'Db';
        const month = posting.entry.date.slice(0, 7);
        const monthLabel = month !== previousMonth ? monthNames[Number(posting.entry.date.slice(5, 7)) - 1] || '' : '';
        const dateCell = posting.entry.date === previousDate ? '<td></td>' : `<td aria-label="${escapeHTML(posting.entry.date)}"><span class="ledger-date"><span class="ledger-date-month" aria-hidden="true">${monthLabel}</span><span aria-hidden="true">${escapeHTML(displayDay(posting.entry.date))}</span></span></td>`;
        previousMonth = month;
        previousDate = posting.entry.date;
        return `<tr>
            ${dateCell}
            <td>${escapeHTML(posting.particular)}</td>
            <td class="mono">J${journalNumberForDate(posting.entry.date)}</td>
            <td class="mono amount">${posting.side === 'debit' ? money(posting.amount) : ''}</td>
            <td class="mono amount">${posting.side === 'credit' ? money(posting.amount) : ''}</td>
            <td class="mono amount ledger-balance">${money(Math.abs(balance))} <span>${balanceSide}</span></td>
            <td class="ledger-actions-cell"><button type="button" class="ledger-delete-button" data-ledger-action="delete" data-id="${posting.entry.id}" aria-label="Delete journal entry ${escapeHTML(posting.entry.ref)} and all its ledger postings" title="Delete journal entry"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button></td>
        </tr>`;
    }).join('');
    const endingSide = balance === 0 ? '—' : (balance > 0 ? 'Db' : 'Cr');
    return `<article class="ledger-sheet">
        <div class="ledger-sheet-scroll"><table class="ledger-table">
            <caption><span>J${journalNumberForDate(`${year}-01-01`)} · ${year} · Amounts in Philippine Pesos</span></caption>
            <colgroup><col style="width:12%"><col style="width:32%"><col style="width:7%"><col style="width:13%"><col style="width:13%"><col style="width:15%"><col style="width:8%"></colgroup>
            <thead>
                <tr class="ledger-account-heading"><th colspan="6">${escapeHTML(account.title)}</th><th>No. ${escapeHTML(account.code)}</th></tr>
                <tr><th>Date</th><th>Particulars</th><th>PR</th><th>Debit</th><th>Credit</th><th>Balance</th><th class="ledger-actions-heading">Actions</th></tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="7" class="ledger-empty">No postings for this account.</td></tr>'}</tbody>
            <tfoot><tr><th colspan="5">Total</th><td class="mono amount ledger-balance">${money(Math.abs(balance))} <span>${endingSide}</span></td><td></td></tr></tfoot>
        </table></div>
    </article>`;
}

export function render() {
    const container = document.getElementById('ledger-accounts-container');
    if (!container) return;
    const filter = document.getElementById('ledger-filter').value;
    const yearFilter = document.getElementById('ledger-year-filter');
    populateYearFilter(yearFilter, journalEntries);
    const selectedYear = yearFilter.value;
    const sheets = chartOfAccounts
        .filter(account => filter === 'ALL' || account.code === filter)
        .map(account => ({ account, postings: postingsFor(account).filter(posting => selectedYear === 'ALL' || posting.entry.date.startsWith(`${selectedYear}-`)) }))
        .filter(({ postings }) => filter !== 'ALL' || postings.length)
        .flatMap(({ account, postings }) => {
            const byYear = new Map();
            postings.forEach(posting => {
                const year = posting.entry.date.slice(0, 4);
                if (!byYear.has(year)) byYear.set(year, []);
                byYear.get(year).push(posting);
            });
            if (!postings.length) return selectedYear === 'ALL' ? [] : [accountTable(account, [], selectedYear)];
            return [...byYear].map(([year, yearlyPostings]) => accountTable(account, yearlyPostings, year));
        });
    container.innerHTML = sheets.join('') || '<p class="empty-state">No postings for these accounts yet. Open General Journal to get started.</p>';
}
