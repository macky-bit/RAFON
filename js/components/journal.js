/* General Journal (split peso/cent layout) */
import { loadTemplate } from '../loader.js';import { journalEntries } from '../state.js';
import { splitAmount } from '../utils.js';

export async function mount(parent) {
    parent.insertAdjacentHTML('beforeend', await loadTemplate('journal'));
}

export function bindEvents() {
    document.getElementById('print-journal-button').addEventListener('click', () => window.print());
}

// 1. Render General Journal
export function render() {
    const tbody = document.getElementById('journal-table-body');
    tbody.innerHTML = '';

    journalEntries.forEach(entry => {
        const debitSplit = splitAmount(entry.debitAmount);
        const creditSplit = splitAmount(entry.creditAmount);

        // Debit Row
        const drRow = document.createElement('tr');
        drRow.className = "hover:bg-slate-50 transition-colors";
        drRow.innerHTML = `
            <td class="border border-slate-300 py-2 px-3 text-center text-xs font-medium text-slate-600 align-top" rowspan="3">${entry.date}</td>
            <td class="border border-slate-300 py-2 px-4 text-slate-900 font-semibold align-top">${entry.debitAcc}</td>
            <td class="border border-slate-300 py-2 px-2 text-center text-xs text-slate-500 font-mono align-top">${entry.debitCode}</td>
            <td class="border-y border-l border-slate-300 py-2 px-2 text-right mono w-28 align-top text-slate-800">${debitSplit.pesos}</td>
            <td class="border-y border-r border-slate-300 py-2 px-1 text-center mono w-8 border-split text-xs text-slate-500 align-top">${debitSplit.cents}</td>
            <td class="border-y border-l border-slate-300 py-2 px-2 text-right mono w-28 bg-slate-50/50"></td>
            <td class="border-y border-r border-slate-300 py-2 px-1 text-center mono w-8 bg-slate-50/50"></td>
        `;
        tbody.appendChild(drRow);

        // Credit Row (Indented standard accounting presentation)
        const crRow = document.createElement('tr');
        crRow.className = "hover:bg-slate-50 transition-colors";
        crRow.innerHTML = `
            <td class="border border-slate-300 py-2 px-4 pl-10 text-slate-700 align-top">${entry.creditAcc}</td>
            <td class="border border-slate-300 py-2 px-2 text-center text-xs text-slate-500 font-mono align-top">${entry.creditCode}</td>
            <td class="border-y border-l border-slate-300 py-2 px-2 text-right mono w-28 bg-slate-50/50"></td>
            <td class="border-y border-r border-slate-300 py-2 px-1 text-center mono w-8 border-split bg-slate-50/50"></td>
            <td class="border-y border-l border-slate-300 py-2 px-2 text-right mono w-28 align-top text-slate-800">${creditSplit.pesos}</td>
            <td class="border-y border-r border-slate-300 py-2 px-1 text-center mono w-8 text-xs text-slate-500 align-top">${creditSplit.cents}</td>
        `;
        tbody.appendChild(crRow);

        // Explanation Row (Italics description)
        const expRow = document.createElement('tr');
        expRow.className = "border-b-2 border-slate-300 bg-slate-50/30";
        expRow.innerHTML = `
            <td class="border border-slate-300 py-1.5 px-6 text-xs text-slate-500 italic" colspan="2">(${entry.explanation})</td>
            <td class="border-y border-l border-slate-300 bg-slate-50/50"></td>
            <td class="border-y border-r border-slate-300 border-split bg-slate-50/50"></td>
            <td class="border-y border-l border-slate-300 bg-slate-50/50"></td>
            <td class="border-y border-r border-slate-300 bg-slate-50/50"></td>
        `;
        tbody.appendChild(expRow);
    });
    if (!tbody.children.length) tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No journal entries yet. Use Post Entry to record a transaction.</td></tr>';

}
