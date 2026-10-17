import assert from 'node:assert/strict';
import { chartOfAccounts, journalEntries } from '../js/state.js';
import { render } from '../js/components/ledger.js';

const container = { innerHTML: '' };
globalThis.document = {
    getElementById(id) {
        return id === 'ledger-accounts-container' ? container : { value: 'ALL' };
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
    ] }
);

render();
assert.ok(container.innerHTML.includes('<strong>Cash</strong></caption>'), 'Ledger heading shows the account name');
assert.ok(container.innerHTML.includes('Account Name: Cash'));
assert.ok(container.innerHTML.indexOf('GJ1') < container.innerHTML.indexOf('GJ2'), 'Entries appear in date order');
assert.ok(container.innerHTML.includes('10/1/2026'), 'Dates use the reference layout');
assert.ok(container.innerHTML.includes('100.00 <span>Dr</span>'), 'First posting has a running balance');
assert.ok(container.innerHTML.includes('70.00 <span>Dr</span>'), 'Credit reduces the running balance');
assert.ok(container.innerHTML.includes('Rent payment'), 'Particulars show the journal title');
assert.ok(container.innerHTML.includes('class="mono">J1</td>'), 'P.R. points to journal 1');
assert.ok(container.innerHTML.includes('<th class="ledger-actions-heading">Actions</th>'), 'Ledger includes an actions column');
assert.ok(container.innerHTML.includes('data-ledger-action="delete" data-id="42"'), 'Ledger posting keeps the database ID for actions');
assert.ok(container.innerHTML.includes('all its ledger postings'), 'Delete action describes its journal entry scope');
assert.equal((container.innerHTML.match(/class="mono">J3<\/td>/g) || []).length, 2, 'Each matching line in a compound entry points to its journal');
assert.ok(container.innerHTML.includes('95.00 <span>Dr</span>'), 'Compound entry lines update the running balance');
console.log('Ledger smoke check passed.');
