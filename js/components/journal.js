/* General Journal (split peso/cent layout) */
import { loadTemplate } from '../loader.js';
import { deleteEntry, journalEntries } from '../state.js';
import { entryLines, escapeHTML, splitAmount } from '../utils.js';
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
    document.getElementById('journal-table-body').addEventListener('click', async event => {
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
    const tbody = document.getElementById('journal-table-body');
    tbody.innerHTML = '';
    journalEntries.forEach(entry => {
        const lines = entryLines(entry);
        lines.forEach((line, index) => {
            const amount = splitAmount(line.amount);
            const debit = line.type === 'Debit';
            const row = document.createElement('tr');
            row.className = `hover:bg-slate-50 transition-colors${index === 0 ? ' journal-entry-start' : ''}`;
            row.innerHTML = `${index === 0 ? `<td class="border border-slate-300 py-2 px-3 text-center text-xs font-medium text-slate-600 align-top" rowspan="${lines.length + 1}">${escapeHTML(entry.date)}</td>` : ''}
                <td class="border border-slate-300 py-2 px-4 ${debit ? 'text-slate-900 font-semibold' : 'pl-10 text-slate-700'} align-top">${escapeHTML(line.accountTitle)}</td>
                <td class="border border-slate-300 py-2 px-2 text-center text-xs text-slate-500 font-mono align-top">${escapeHTML(line.accountCode)}</td>
                <td class="border-y border-l border-slate-300 py-2 px-2 text-right mono w-28 align-top">${debit ? amount.pesos : ''}</td>
                <td class="border-y border-r border-slate-300 py-2 px-1 text-center mono w-8 border-split align-top">${debit ? amount.cents : ''}</td>
                <td class="border-y border-l border-slate-300 py-2 px-2 text-right mono w-28 align-top">${debit ? '' : amount.pesos}</td>
                <td class="border-y border-r border-slate-300 py-2 px-1 text-center mono w-8 align-top">${debit ? '' : amount.cents}</td>
                ${index === 0 ? `<td class="journal-row-actions-cell" rowspan="${lines.length + 1}"><div class="journal-row-actions">
                    <button type="button" data-entry-action="edit" data-id="${entry.id}" aria-label="Edit journal entry ${escapeHTML(entry.ref)}" title="Edit"><i class="fa-solid fa-pen" aria-hidden="true"></i></button>
                    <button type="button" data-entry-action="delete" data-id="${entry.id}" aria-label="Delete journal entry ${escapeHTML(entry.ref)}" title="Delete"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button>
                </div></td>` : ''}`;
            tbody.appendChild(row);
        });
        const explanation = document.createElement('tr');
        explanation.className = 'journal-explanation-row border-b-2 border-slate-300 bg-slate-50/30';
        explanation.innerHTML = `<td class="border border-slate-300 py-1.5 px-6 text-xs text-slate-500 italic" colspan="2">(${escapeHTML(entry.explanation)})</td><td colspan="4" class="border border-slate-300 bg-slate-50/50"></td>`;
        tbody.appendChild(explanation);
    });
    if (!tbody.children.length) tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No journal entries yet. Use Post Entry to record a transaction.</td></tr>';
}
