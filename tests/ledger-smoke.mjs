import assert from 'node:assert/strict';
import { chartOfAccounts, journalEntries } from '../js/state.js';
import { render } from '../js/components/ledger.js';

const container = { innerHTML: '' };
const filters = new Map();
globalThis.document = {
    getElementById(id) {
        if (id === 'ledger-accounts-container') return container;
        if (!filters.has(id)) filters.set(id, { value: 'ALL', innerHTML: '' });
        return filters.get(id);
    }
};

chartOfAccounts.push({ code: '101', title: 'Cash', normal: 'Debit' });
journalEntries.push(
    { id: 43, journalNumber: 2, date: '2026-10-02', ref: 'GJ2', title: 'Rent payment', explanation: 'Paid rent', debitCode: '504', debitAcc: 'Rent', debitAmount: 30, creditCode: '101', creditAcc: 'Cash', creditAmount: 30 },
    { id: 42, journalNumber: 1, date: '2026-10-01', ref: 'GJ1', title: 'Cash sale', explanation: 'Cash sale', debitCode: '101', debitAcc: 'Cash', debitAmount: 100, creditCode: '401', creditAcc: 'Sales', creditAmount: 100 },
    { id: 44, journalNumber: 3, date: '2026-10-03', ref: 'GJ3', title: 'Compound receipt', explanation: 'Compound receipt', lines: [
        { type: 'Debit', accountCode: '101', accountTitle: 'Cash', amount: 20 },
        { type: 'Debit', accountCode: '101', accountTitle: 'Cash', amount: 5 },
        { type: 'Credit', accountCode: '401', accountTitle: 'Sales', amount: 25 }
    ] },
    { id: 45, journalNumber: 4, date: '2027-01-01', ref: 'GJ4', title: 'Next year sale', explanation: 'Next year sale', debitCode: '101', debitAcc: 'Cash', debitAmount: 40, creditCode: '401', creditAcc: 'Sales', creditAmount: 40 }
);

render();
assert.ok(container.innerHTML.includes('<th colspan="6">Cash</th>'), 'Ledger heading shows the account name without a prefix');
assert.ok(!container.innerHTML.includes('Account Name:'), 'Ledger headings omit the account name label');
assert.ok(container.innerHTML.indexOf('GJ1') < container.innerHTML.indexOf('GJ2'), 'Entries appear in date order');
assert.ok(container.innerHTML.includes('10/1/2026'), 'Dates use the reference layout');
assert.ok(container.innerHTML.includes('100.00 <span>Dr</span>'), 'First posting has a running balance');
assert.ok(container.innerHTML.includes('70.00 <span>Dr</span>'), 'Credit reduces the running balance');
assert.ok(container.innerHTML.includes('Rent payment'), 'Particulars show the journal title');
assert.ok(container.innerHTML.includes('class="mono">J1</td>'), 'P.R. points to journal 1');
assert.ok(container.innerHTML.includes('<th class="ledger-actions-heading">Actions</th>'), 'Ledger includes an actions column');
assert.ok(container.innerHTML.includes('data-ledger-action="delete" data-id="42"'), 'Ledger posting keeps the database ID for actions');
assert.ok(container.innerHTML.includes('all its ledger postings'), 'Delete action describes its journal entry scope');
assert.equal((container.innerHTML.match(/class="mono">J1<\/td>/g) || []).length, 4, 'All 2026 postings use J1');
assert.ok(container.innerHTML.includes('95.00 <span>Dr</span>'), 'Compound entry lines update the running balance');
assert.ok(container.innerHTML.includes('J2 · 2027'), 'The next year uses J2 in a separate ledger table');
assert.equal((container.innerHTML.match(/<table class="ledger-table">/g) || []).length, 2, 'Each journal year has its own ledger table');
globalThis.document.getElementById('ledger-year-filter').value = '2027';
render();
assert.equal((container.innerHTML.match(/<table class="ledger-table">/g) || []).length, 1, 'Ledger year filter shows only the selected year');
assert.ok(!container.innerHTML.includes('Rent payment'), 'Ledger year filter hides other years');
console.log('Ledger smoke check passed.');
