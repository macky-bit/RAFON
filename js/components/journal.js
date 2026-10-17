/* General Journal (split peso/cent layout) */
import { loadTemplate } from '../loader.js';
import { deleteEntry, journalEntries } from '../state.js';
import { entryLines, escapeHTML, journalNumberForDate, populateYearFilter, splitAmount } from '../utils.js';
import { confirmAction } from '../confirmAction.js';

export async function mount(parent) {
    parent.insertAdjacentHTML('beforeend', await loadTemplate('journal'));
}

function showFeedback(message, isError = false) {
    const feedback = document.getElementById('journal-feedback');
    feedback.textContent = message;
    feedback.classList.toggle('is-error', isError);
    feedback.classList.remove('hidden');
}

export function bindEvents({ onNewEntry, onEditEntry }) {
    document.getElementById('new-entry-button').addEventListener('click', event => {
        document.getElementById('journal-feedback').classList.add('hidden');
        onNewEntry(null, event.currentTarget);
    });
    document.getElementById('print-journal-button').addEventListener('click', () => window.print());
    document.getElementById('journal-search').addEventListener('input', render);
    document.getElementById('journal-year-filter').addEventListener('change', render);
    document.getElementById('journal-years-container').addEventListener('click', async event => {
        const button = event.target.closest('[data-entry-action]');
        if (!button) return;
        const entry = journalEntries.find(item => item.id === Number(button.dataset.id));
        if (!entry) return;
        if (button.dataset.entryAction === 'edit') {
            document.getElementById('journal-feedback').classList.add('hidden');
            onEditEntry(entry, button);
            return;
        }
        if (!await confirmAction({ title: `Delete journal entry ${entry.ref}?`, message: 'Are you sure? This entry will be removed from the General Journal and financial reports. You can restore it from Backup & Recovery.', trigger: button })) return;
        button.disabled = true;
        try {
            await deleteEntry(entry.id);
            showFeedback(`Journal entry ${entry.ref} was deleted and removed from financial reports.`);
            document.getElementById('new-entry-button').focus();
        } catch (error) {
            showFeedback(`Could not delete the journal entry: ${error.message}`, true);
            button.disabled = false;
        }
    });
}

export function render() {
    const container = document.getElementById('journal-years-container');
    const yearFilter = document.getElementById('journal-year-filter');
    populateYearFilter(yearFilter, journalEntries);
    const selectedYear = yearFilter.value;
    const query = (document.getElementById('journal-search')?.value || '').trim().toLowerCase();
    const visibleEntries = journalEntries.filter(entry => (selectedYear === 'ALL' || entry.date.startsWith(`${selectedYear}-`)) && (!query || [
        `J${journalNumberForDate(entry.date)}`, entry.title, entry.ref, entry.date, entry.explanation,
        ...entryLines(entry).flatMap(line => [line.accountTitle, line.accountCode])
    ].some(value => String(value ?? '').toLowerCase().includes(query))));
    const byYear = new Map();
    visibleEntries.forEach(entry => {
        const year = entry.date.slice(0, 4);
        if (!byYear.has(year)) byYear.set(year, []);
        byYear.get(year).push(entry);
    });
    container.innerHTML = [...byYear].map(([year, entries]) => {
        const rows = [];
        entries.forEach(entry => {
        const lines = entryLines(entry);
        lines.forEach((line, index) => {
            const amount = splitAmount(line.amount);
            const debit = line.type === 'Debit';
            const rowClass = `hover:bg-slate-50 transition-colors${index === 0 ? ' journal-entry-start' : ''}${index === lines.length - 1 ? ' journal-entry-end' : ''}`;
            rows.push(`<tr class="${rowClass}">${index === 0 ? `<td class="journal-date-cell border border-slate-300 py-2 px-3 text-center text-xs font-medium text-slate-600 align-top" rowspan="${lines.length}">
                    <span>${escapeHTML(entry.date)}</span>
                    <div class="journal-date-details"><strong>J${journalNumberForDate(entry.date)} · ${escapeHTML(entry.title || entry.explanation)}</strong><span>(${escapeHTML(entry.explanation)})</span></div>
                </td>` : ''}
                <td class="border border-slate-300 py-2 px-4 ${debit ? 'text-slate-900 font-semibold' : 'pl-10 text-slate-700'} align-top">${escapeHTML(line.accountTitle)}</td>
                <td class="border border-slate-300 py-2 px-2 text-center text-xs text-slate-500 font-mono align-top">${escapeHTML(line.accountCode)}</td>
                <td class="border-y border-l border-slate-300 py-2 px-2 text-right mono w-28 align-top">${debit ? amount.pesos : ''}</td>
                <td class="border-y border-r border-slate-300 py-2 px-1 text-center mono w-8 border-split align-top">${debit ? amount.cents : ''}</td>
                <td class="border-y border-l border-slate-300 py-2 px-2 text-right mono w-28 align-top">${debit ? '' : amount.pesos}</td>
                <td class="border-y border-r border-slate-300 py-2 px-1 text-center mono w-8 align-top">${debit ? '' : amount.cents}</td>
                ${index === 0 ? `<td class="journal-row-actions-cell" rowspan="${lines.length}"><div class="journal-row-actions">
                    <button type="button" data-entry-action="edit" data-id="${entry.id}" aria-label="Edit journal entry ${escapeHTML(entry.ref)}" title="Edit"><i class="fa-solid fa-pen" aria-hidden="true"></i></button>
                    <button type="button" data-entry-action="delete" data-id="${entry.id}" aria-label="Delete journal entry ${escapeHTML(entry.ref)}" title="Delete"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button>
                </div></td>` : ''}</tr>`);
        });
        });
        return `<section class="journal-year-section" aria-label="Journal ${escapeHTML(year)}">
            <h2 class="journal-year-heading">J${journalNumberForDate(`${year}-01-01`)} · ${escapeHTML(year)}</h2>
            <div class="journal-table-wrap"><table class="journal-table">
                <thead><tr>
                    <th class="border border-slate-300 py-2.5 px-3 w-28 text-center">Date</th>
                    <th class="border border-slate-300 py-2.5 px-4 text-left">Account Titles &amp; Explanation</th>
                    <th class="border border-slate-300 py-2.5 px-2 w-16 text-center">P.R.</th>
                    <th class="border border-slate-300 py-2.5 px-0 w-36 text-center" colspan="2">Debit (₱)</th>
                    <th class="border border-slate-300 py-2.5 px-0 w-36 text-center" colspan="2">Credit (₱)</th>
                    <th class="journal-actions-heading" scope="col">Actions</th>
                </tr></thead><tbody>${rows.join('')}</tbody>
            </table></div>
        </section>`;
    }).join('') || `<p class="empty-state">${journalEntries.length ? 'No journal entries match your search or year.' : 'No journal entries yet. Use Post Entry to record a transaction.'}</p>`;
}
