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
    { id: 2, date: '2026-10-02', ref: 'GJ2', explanation: 'Paid rent', debitCode: '504', debitAcc: 'Rent', debitAmount: 30, creditCode: '101', creditAcc: 'Cash', creditAmount: 30 },
    { id: 1, date: '2026-10-01', ref: 'GJ1', explanation: 'Cash sale', debitCode: '101', debitAcc: 'Cash', debitAmount: 100, creditCode: '401', creditAcc: 'Sales', creditAmount: 100 },
    { id: 3, date: '2026-10-03', ref: 'GJ3', explanation: 'Compound receipt', lines: [
        { type: 'Debit', accountCode: '101', accountTitle: 'Cash', amount: 20 },
        { type: 'Debit', accountCode: '101', accountTitle: 'Cash', amount: 5 },
        { type: 'Credit', accountCode: '401', accountTitle: 'Sales', amount: 25 }
    ] }
);

render();
assert.ok(container.innerHTML.includes('GENERAL LEDGER'));
assert.ok(container.innerHTML.includes('Account Name: Cash'));
assert.ok(container.innerHTML.indexOf('GJ1') < container.innerHTML.indexOf('GJ2'), 'Entries appear in date order');
assert.ok(container.innerHTML.includes('10/1/2026'), 'Dates use the reference layout');
assert.ok(container.innerHTML.includes('100.00 <span>Dr</span>'), 'First posting has a running balance');
assert.ok(container.innerHTML.includes('70.00 <span>Dr</span>'), 'Credit reduces the running balance');
assert.ok(container.innerHTML.includes('Paid rent'), 'Particulars show the explanation');
assert.ok(container.innerHTML.includes('<th class="ledger-actions-heading">Actions</th>'), 'Ledger includes an actions column');
assert.ok(container.innerHTML.includes('data-ledger-action="delete" data-id="1"'), 'Ledger posting has a delete action');
assert.ok(container.innerHTML.includes('all its ledger postings'), 'Delete action describes its journal entry scope');
assert.equal((container.innerHTML.match(/class="mono">GJ3<\/td>/g) || []).length, 2, 'Each matching line in a compound entry posts to the ledger');
assert.ok(container.innerHTML.includes('95.00 <span>Dr</span>'), 'Compound entry lines update the running balance');
console.log('Ledger smoke check passed.');
