/* General Ledger: chronological postings with a running balance. */
import { loadTemplate } from '../loader.js';
import { chartOfAccounts, deleteEntry, journalEntries } from '../state.js';
import { entryLines, escapeHTML } from '../utils.js';
import { confirmAction } from '../confirmAction.js';

const money = amount => Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const displayDate = date => {
    const [year, month, day] = String(date).split('-');
    return year && month && day ? `${Number(month)}/${Number(day)}/${year}` : String(date);
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
}

export function bindEvents() {
    document.getElementById('ledger-filter').addEventListener('change', render);
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

function accountTable(account, postings) {
    let balance = 0;
    const rows = postings.map(posting => {
        balance += (posting.side === 'debit' ? 1 : -1) * posting.amount;
        const balanceSide = balance < 0 ? 'Cr' : 'Dr';
        return `<tr>
            <td>${escapeHTML(displayDate(posting.entry.date))}</td>
            <td>${escapeHTML(posting.particular)}</td>
            <td class="mono">J${escapeHTML(posting.entry.journalNumber)}</td>
            <td class="mono amount">${posting.side === 'debit' ? money(posting.amount) : ''}</td>
            <td class="mono amount">${posting.side === 'credit' ? money(posting.amount) : ''}</td>
            <td class="mono amount ledger-balance">${money(Math.abs(balance))} <span>${balanceSide}</span></td>
            <td class="ledger-actions-cell"><button type="button" class="ledger-delete-button" data-ledger-action="delete" data-id="${posting.entry.id}" aria-label="Delete journal entry ${escapeHTML(posting.entry.ref)} and all its ledger postings" title="Delete journal entry"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button></td>
        </tr>`;
    }).join('');
    const endingSide = balance === 0 ? '—' : (balance > 0 ? 'Dr' : 'Cr');
    return `<article class="ledger-sheet">
        <div class="ledger-sheet-scroll"><table class="ledger-table">
            <caption><span>Amounts in Philippine Pesos</span></caption>
            <thead>
                <tr class="ledger-account-heading"><th colspan="6">Account Name: ${escapeHTML(account.title)}</th><th>No. ${escapeHTML(account.code)}</th></tr>
                <tr><th>Date</th><th>Particulars</th><th>PR</th><th>Debit</th><th>Credit</th><th>Balance</th><th class="ledger-actions-heading">Actions</th></tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="7" class="ledger-empty">No postings for this account.</td></tr>'}</tbody>
            <tfoot><tr><th colspan="5">Ending balance</th><td class="mono amount ledger-balance">${money(Math.abs(balance))} <span>${endingSide}</span></td><td></td></tr></tfoot>
        </table></div>
    </article>`;
}

export function render() {
    const container = document.getElementById('ledger-accounts-container');
    if (!container) return;
    const filter = document.getElementById('ledger-filter').value;
    const sheets = chartOfAccounts
        .filter(account => filter === 'ALL' || account.code === filter)
        .map(account => ({ account, postings: postingsFor(account) }))
        .filter(({ postings }) => filter !== 'ALL' || postings.length)
        .map(({ account, postings }) => accountTable(account, postings));
    container.innerHTML = sheets.join('') || '<p class="empty-state">No postings for these accounts yet. Open General Journal to get started.</p>';
}
