import assert from 'node:assert/strict';
import { chartOfAccounts, journalEntries } from '../js/state.js';
import { render as renderJournal } from '../js/components/journal.js';
import { render as renderTrialBalance } from '../js/components/trialBalance.js';
import { render as renderIncomeStatement } from '../js/components/incomeStatement.js';
import { render as renderBalanceSheet } from '../js/components/balanceSheet.js';

const elements = new Map();
function element() {
    const node = {
        innerHTML: '', innerText: '', textContent: '', children: [],
        classList: { toggle() {} },
        appendChild(child) { this.children.push(child); },
        querySelector(selector) {
            if (selector === 'span') return { lastChild: { textContent: '' }, innerText: '' };
            return { className: '' };
        }
    };
    return node;
}
globalThis.document = {
    getElementById(id) {
        if (!elements.has(id)) elements.set(id, element());
        return elements.get(id);
    },
    createElement: element
};

chartOfAccounts.push(
    { code: '101', title: 'Cash', category: 'Asset', normal: 'Debit' },
    { code: '201', title: 'Payable', category: 'Liability', normal: 'Credit' },
    { code: '401', title: 'Sales', category: 'Revenue', normal: 'Credit' },
    { code: '503', title: 'Utilities', category: 'Expense', normal: 'Debit' }
);
journalEntries.push({
    id: 43, journalNumber: 1, date: '2026-10-16', ref: 'COMPOUND-1', title: 'Compound sale', explanation: 'Sale with expense and payable',
    lines: [
        { type: 'Debit', accountCode: '101', accountTitle: 'Cash', amount: 100 },
        { type: 'Debit', accountCode: '503', accountTitle: 'Utilities', amount: 25 },
        { type: 'Credit', accountCode: '201', accountTitle: 'Payable', amount: 50 },
        { type: 'Credit', accountCode: '401', accountTitle: 'Sales', amount: 75 }
    ]
});

renderJournal();
assert.equal(elements.get('journal-table-body').children.length, 4, 'Journal renders four posting lines');
assert.match(elements.get('journal-table-body').children[0].innerHTML, /rowspan="4"/);
assert.match(elements.get('journal-table-body').children[0].innerHTML, /J1 · Compound sale/, 'Journal shows its number and title below the date');
renderTrialBalance();
assert.equal(elements.get('trial-balance-body').children.length, 4, 'Trial balance includes all four accounts');
assert.equal(elements.get('tb-total-debit').innerText, elements.get('tb-total-credit').innerText);
renderIncomeStatement();
assert.match(elements.get('is-total-revenue').innerText, /75\.00/);
assert.match(elements.get('is-total-expenses').innerText, /25\.00/);
renderBalanceSheet();
assert.equal(elements.get('bs-summary-assets').innerText, elements.get('bs-total-liab-equity').innerText);
console.log('Compound journal and report checks passed.');
