/* Balance Sheet accounting-equation worksheet. */
import { loadTemplate } from '../loader.js';
import { chartOfAccounts, journalEntries } from '../state.js';
import { entryLines, escapeHTML } from '../utils.js';

const baseColumns = [
    { key: 'cash', label: 'Cash', side: 'asset' },
    { key: 'receivables', label: 'Accounts Receivable', side: 'asset' },
    { key: 'inventories', label: 'Inventories', side: 'asset' },
    { key: 'equipment', label: 'Equipment', side: 'asset' },
    { key: 'property', label: 'Land & Building', side: 'asset' },
    { key: 'intangibles', label: 'Intangible Assets', side: 'asset' },
    { key: 'payables', label: 'Accounts Payable', side: 'liability' },
    { key: 'unearned', label: 'Unearned Revenue', side: 'liability' },
    { key: 'capital', label: "Owner's Capital", side: 'equity' },
    { key: 'revenue', label: 'Revenue', side: 'equity' },
    { key: 'expenses', label: 'Expenses', side: 'equity' }
];

const otherColumns = {
    asset: { key: 'otherAssets', label: 'Other Assets', side: 'asset' },
    liability: { key: 'otherLiabilities', label: 'Other Liabilities', side: 'liability' }
};

const number = value => Math.abs(value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money = value => `${value < -0.005 ? '−' : ''}₱${number(value)}`;
const movement = (value, withPeso) => `${value < 0 ? '−' : '+'}${withPeso ? '₱' : ''}${number(value)}`;

function columnFor(account) {
    const code = String(account.code);
    const title = account.title.toLowerCase();
    if (account.category === 'Asset') {
        if (['101', '110'].includes(code) || /cash|bank/.test(title)) return 'cash';
        if (['102', '120', '125'].includes(code) || /accounts receivable|allowance for bad debts/.test(title)) return 'receivables';
        if (['103', '140'].includes(code) || /inventory|inventories/.test(title)) return 'inventories';
        if (['150', '151', '155'].includes(code) || /equipment|appliances/.test(title)) return 'equipment';
        if (['160', '170', '175'].includes(code) || /\bland\b|building/.test(title)) return 'property';
        if (/intangible|goodwill|patent|trademark/.test(title)) return 'intangibles';
        return 'otherAssets';
    }
    if (account.category === 'Liability') {
        if (['201', '210'].includes(code) || /accounts payable/.test(title)) return 'payables';
        if (code === '270' || /unearned revenue/.test(title)) return 'unearned';
        return 'otherLiabilities';
    }
    if (account.category === 'Equity') return 'capital';
    if (account.category === 'Revenue') return 'revenue';
    if (account.category === 'Expense') return 'expenses';
    return null;
}

function headings(assetColumns, liabilityColumns, equityColumns) {
    const label = column => `<th scope="col" class="balance-column-heading">${escapeHTML(column.label)}</th>`;
    return `<tr class="balance-groups">
        <th id="bs-assets-list" scope="colgroup" colspan="${assetColumns.length}">Assets</th>
        <th class="balance-operator" rowspan="2" scope="col">=</th>
        <th id="bs-liabilities-list" scope="colgroup" colspan="${liabilityColumns.length}">Liabilities</th>
        <th class="balance-operator" rowspan="2" scope="col">+</th>
        <th id="bs-equity-list" scope="colgroup" colspan="${equityColumns.length}">Owner's Equity</th>
    </tr><tr class="balance-account-headings">
        ${assetColumns.map(label).join('')}
        ${liabilityColumns.map(label).join('')}
        ${equityColumns.map(label).join('')}
    </tr>`;
}

function transactionRow(entry, changes, assetColumns, liabilityColumns, equityColumns) {
    const groups = [assetColumns, liabilityColumns, equityColumns];
    let firstAmount = true;
    const cells = groups.map(columns => columns.map(column => {
        const value = changes[column.key] || 0;
        if (Math.abs(value) < 0.005) return '<td class="balance-amount mono">—</td>';
        const text = movement(value, firstAmount);
        firstAmount = false;
        return `<td class="balance-amount mono">${text}</td>`;
    }));
    const detail = escapeHTML(`${entry.date || ''} · ${entry.ref || entry.title || 'Journal entry'}`);
    return `<tr class="balance-transaction" title="${detail}" aria-label="${detail}">
        ${cells[0].join('')}<td class="balance-operator">=</td>
        ${cells[1].join('')}<td class="balance-operator">+</td>${cells[2].join('')}
    </tr>`;
}

export async function mount(parent) {
    parent.insertAdjacentHTML('beforeend', await loadTemplate('balanceSheet'));
}

export function render() {
    const accounts = new Map(chartOfAccounts.map(account => [String(account.code), account]));
    const rows = [];
    const totals = Object.fromEntries([...baseColumns, ...Object.values(otherColumns)].map(column => [column.key, 0]));
    const usedOther = new Set();

    for (const entry of journalEntries) {
        const changes = {};
        for (const line of entryLines(entry)) {
            const account = accounts.get(String(line.accountCode));
            if (!account) continue;
            const key = columnFor(account);
            if (!key) continue;
            const amount = Number(line.amount);
            const increase = account.category === 'Asset' ? line.type === 'Debit' : line.type === 'Credit';
            changes[key] = (changes[key] || 0) + (increase ? amount : -amount);
            if (key === 'otherAssets' || key === 'otherLiabilities') usedOther.add(key);
        }
        for (const [key, value] of Object.entries(changes)) totals[key] += value;
        rows.push({ entry, changes });
    }

    const assetColumns = baseColumns.filter(column => column.side === 'asset');
    const liabilityColumns = baseColumns.filter(column => column.side === 'liability');
    const equityColumns = baseColumns.filter(column => column.side === 'equity');
    if (usedOther.has('otherAssets')) assetColumns.push(otherColumns.asset);
    if (usedOther.has('otherLiabilities')) liabilityColumns.push(otherColumns.liability);
    const totalColumns = assetColumns.length + liabilityColumns.length + equityColumns.length + 2;
    const totalAssets = assetColumns.reduce((sum, column) => sum + totals[column.key], 0);
    const totalLiabilities = liabilityColumns.reduce((sum, column) => sum + totals[column.key], 0);
    const totalEquity = equityColumns.reduce((sum, column) => sum + totals[column.key], 0);
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
    const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.005;

    document.getElementById('bs-table-head').innerHTML = headings(assetColumns, liabilityColumns, equityColumns);
    document.getElementById('bs-transactions').innerHTML = rows.length
        ? rows.map(({ entry, changes }) => transactionRow(entry, changes, assetColumns, liabilityColumns, equityColumns)).join('')
        : `<tr><td colspan="${totalColumns}" class="balance-empty">No journal transactions recorded yet.</td></tr>`;

    const accountTotal = (column, first) => `<td class="balance-amount mono">${first ? '<span class="balance-row-label">Account totals</span>' : ''}<strong>${money(totals[column.key])}</strong></td>`;
    document.getElementById('bs-table-foot').innerHTML = `
        <tr class="balance-account-totals">
            ${assetColumns.map((column, index) => accountTotal(column, index === 0)).join('')}
            <td class="balance-operator">=</td>
            ${liabilityColumns.map(column => accountTotal(column, false)).join('')}
            <td class="balance-operator">+</td>
            ${equityColumns.map(column => accountTotal(column, false)).join('')}
        </tr>
        <tr class="balance-side-totals">
            <th colspan="${assetColumns.length}" scope="row"><span>Total Assets</span><strong id="bs-total-assets" class="mono">${money(totalAssets)}</strong></th>
            <td class="balance-operator">=</td>
            <th colspan="${liabilityColumns.length + equityColumns.length + 1}" scope="row">
                <span>Total Liabilities &amp; Equity</span><strong id="bs-side-liab-equity" class="mono">${money(totalLiabilitiesAndEquity)}</strong>
                <small>Liabilities <span id="bs-total-liabilities" class="mono">${money(totalLiabilities)}</span> · Owner's Equity <span id="bs-total-equity" class="mono">${money(totalEquity)}</span></small>
            </th>
        </tr>
        <tr class="balance-final">
            <td colspan="${assetColumns.length}" class="mono"><strong id="bs-summary-assets">${money(totalAssets)}</strong></td>
            <td class="balance-operator">=</td>
            <td colspan="${liabilityColumns.length + equityColumns.length + 1}" class="mono"><strong id="bs-total-liab-equity">${money(totalLiabilitiesAndEquity)}</strong></td>
        </tr>`;

    const balanceStatus = document.getElementById('bs-balance-status');
    balanceStatus.classList.toggle('is-unbalanced', !isBalanced);
    balanceStatus.querySelector('i').className = `fa-solid ${isBalanced ? 'fa-check' : 'fa-triangle-exclamation'}`;
    balanceStatus.querySelector('span').textContent = isBalanced ? 'Balanced' : 'Unbalanced';
}
