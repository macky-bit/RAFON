import assert from 'node:assert/strict';
import { suppliers } from '../js/state.js';
import { render } from '../js/components/suppliers.js';

const elements = Object.fromEntries([
    'supplier-directory', 'supplier-search', 'supplier-category-filter', 'supplier-status-filter',
    'supplier-role-filter', 'supplier-sort', 'supplier-active-count', 'supplier-primary-count',
    'supplier-backup-count', 'supplier-category-count', 'supplier-results-summary'
].map(id => [id, { value: '', innerHTML: '', textContent: '' }]));
elements['supplier-status-filter'].value = 'Active';
elements['supplier-sort'].value = 'name';
globalThis.document = { getElementById: id => elements[id] };

suppliers.push(
    { id: 1, businessName: 'First Choice', category: 'Seafood', status: 'Active', isPreferred: true, updatedAt: '2026-10-16' },
    { id: 2, businessName: 'Alternate', category: 'Seafood', status: 'Active', isPreferred: false, updatedAt: '2026-10-16' }
);

render();
assert.equal(elements['supplier-primary-count'].textContent, '1');
assert.equal(elements['supplier-backup-count'].textContent, '1');
assert.ok(elements['supplier-directory'].innerHTML.includes('Primary'));
assert.ok(elements['supplier-directory'].innerHTML.includes('Backup'));

elements['supplier-role-filter'].value = 'Backup';
render();
assert.ok(elements['supplier-directory'].innerHTML.includes('Alternate'));
assert.ok(!elements['supplier-directory'].innerHTML.includes('First Choice'));
console.log('Supplier role smoke check passed.');
