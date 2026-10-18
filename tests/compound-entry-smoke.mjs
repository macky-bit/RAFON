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
assert.equal((elements.get('journal-years-container').innerHTML.match(/<tr class="hover:bg-slate-50/g) || []).length, 5, 'Journal renders four posting lines and an explanation row');
assert.match(elements.get('journal-years-container').innerHTML, /rowspan="5"/);
const journalHtml = elements.get('journal-years-container').innerHTML;
assert.doesNotMatch(journalHtml, /J1 · Compound sale/, 'Journal no longer shows number and title under the date');
assert.match(journalHtml, /class="journal-explanation[^\"]*">\(To record Sale with expense and payable\)<\/td>/, 'Journal explanation adds To record');
assert.match(journalHtml, /journal-title-indent/, 'Credit/last account titles are indented');
renderTrialBalance();
assert.equal(elements.get('trial-balance-body').children.length, 4, 'Trial balance includes all four accounts');
assert.equal(elements.get('tb-total-debit').innerText, elements.get('tb-total-credit').innerText);
renderIncomeStatement();
assert.match(elements.get('is-total-revenue').innerText, /75\.00/);
assert.match(elements.get('is-total-expenses').innerText, /25\.00/);
renderBalanceSheet();
const balanceHead = elements.get('bs-table-head').innerHTML;
const balanceRows = elements.get('bs-transactions').innerHTML;
const balanceFoot = elements.get('bs-table-foot').innerHTML;
assert.match(balanceHead, /colspan="6">Assets/);
assert.match(balanceHead, /colspan="2">Liabilities/);
assert.match(balanceHead, /colspan="3">Owner's Equity/);
assert.match(balanceRows, /\+₱100\.00/);
assert.match(balanceRows, /−25\.00/);
assert.equal((balanceRows.match(/₱/g) || []).length, 1, 'Only the first transaction amount has a peso sign');
assert.match(balanceFoot, /id="bs-total-assets"[^>]*>₱100\.00/);
assert.match(balanceFoot, /id="bs-total-liabilities"[^>]*>₱50\.00/);
assert.match(balanceFoot, /id="bs-total-equity"[^>]*>₱50\.00/);
assert.match(balanceFoot, /id="bs-summary-assets">₱100\.00/);
assert.match(balanceFoot, /id="bs-total-liab-equity">₱100\.00/);
chartOfAccounts.push(
    { code: '145', title: 'Prepaid Rent, Insurance & Supplies', category: 'Asset', normal: 'Debit' },
    { code: '230', title: 'Notes Payable', category: 'Liability', normal: 'Credit' }
);
journalEntries.push({
    id: 44, journalNumber: 2, date: '2026-10-17', ref: 'COMPOUND-2', title: 'Mixed accounts',
    lines: [
        { type: 'Debit', accountCode: '101', amount: 10 },
        { type: 'Debit', accountCode: '145', amount: 20 },
        { type: 'Credit', accountCode: '230', amount: 30 }
    ]
});
renderJournal();
assert.doesNotMatch(elements.get('journal-years-container').innerHTML, /J1 · Mixed accounts/, 'Entry title is no longer shown under the date');
renderBalanceSheet();
assert.match(elements.get('bs-table-head').innerHTML, /Other Assets/);
assert.match(elements.get('bs-table-head').innerHTML, /Other Liabilities/);
assert.match(elements.get('bs-transactions').innerHTML, /\+₱10\.00/);
assert.match(elements.get('bs-transactions').innerHTML, /\+20\.00/);
assert.match(elements.get('bs-table-foot').innerHTML, /id="bs-summary-assets">₱130\.00/);
assert.match(elements.get('bs-table-foot').innerHTML, /id="bs-total-liab-equity">₱130\.00/);
// Journal book labels advance once per calendar year, regardless of entry count.
journalEntries.push({ id: 45, journalNumber: 3, date: '2027-01-01', ref: 'NEXT-YEAR', title: 'New year', explanation: 'To record New year', debitCode: '101', debitAcc: 'Cash', debitAmount: 10, creditCode: '201', creditAcc: 'Payable', creditAmount: 10 });
renderJournal();
assert.doesNotMatch(elements.get('journal-years-container').innerHTML, /To record To record/, 'Journal does not duplicate an existing To record prefix');
assert.match(elements.get('journal-years-container').innerHTML, /J2 · 2027/, 'A 2027 entry uses J2');
assert.equal((elements.get('journal-years-container').innerHTML.match(/<table class="journal-table">/g) || []).length, 2, 'Each year has its own journal table');
elements.get('journal-year-filter').value = '2027';
renderJournal();
assert.equal((elements.get('journal-years-container').innerHTML.match(/<table class="journal-table">/g) || []).length, 1, 'Year filter shows one table');
assert.ok(!elements.get('journal-years-container').innerHTML.includes('Compound sale'), 'Year filter hides other years');
journalEntries.push(
    { id: 46, date: '2027-01-01', ref: 'SAME-DAY', title: 'Same day', explanation: 'Same day', debitCode: '101', debitAcc: 'Cash', debitAmount: 1, creditCode: '201', creditAcc: 'Payable', creditAmount: 1 },
    { id: 47, date: '2027-01-02', ref: 'NEXT-DAY', title: 'Next day', explanation: 'Next day', debitCode: '101', debitAcc: 'Cash', debitAmount: 1, creditCode: '201', creditAcc: 'Payable', creditAmount: 1 },
    { id: 48, date: '2027-02-01', ref: 'NEXT-MONTH', title: 'Next month', explanation: 'Next month', debitCode: '101', debitAcc: 'Cash', debitAmount: 1, creditCode: '201', creditAcc: 'Payable', creditAmount: 1 }
);
renderJournal();
const datedJournal = elements.get('journal-years-container').innerHTML;
assert.equal((datedJournal.match(/aria-label="2027-01-01"/g) || []).length, 1, 'Same-day journal entries show their date once');
assert.match(datedJournal, /ledger-date-month" aria-hidden="true">Jan<\/span><span aria-hidden="true">1<\/span>/, 'First journal date shows the month and day');
assert.match(datedJournal, /ledger-date-month" aria-hidden="true"><\/span><span aria-hidden="true">2<\/span>/, 'Next day aligns with the first day without repeating the month');
assert.match(datedJournal, /ledger-date-month" aria-hidden="true">Feb<\/span><span aria-hidden="true">1<\/span>/, 'Next month shows its month label');
console.log('Compound journal and report checks passed.');
