/* Shared helpers */

// Split monetary values into pesos and 2-digit cents
export function splitAmount(val) {
    const num = Math.abs(Number(val) || 0);
    const parts = num.toFixed(2).split('.');
    return {
        pesos: Number(parts[0]).toLocaleString('en-US'),
        cents: parts[1]
    };
}

// Format raw number to PHP currency string
export function formatPHP(amount) {
    return '₱ ' + (Number(amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    })[character]);
}

export function journalNumberForDate(date) {
    return Math.max(1, Number(String(date).slice(0, 4)) - 2025);
}

export function populateYearFilter(select, entries) {
    const selected = select.value || 'ALL';
    const years = [...new Set(entries.map(entry => String(entry.date).slice(0, 4)))].sort((a, b) => b.localeCompare(a));
    select.innerHTML = '<option value="ALL">All years</option>' + years.map(year =>
        `<option value="${escapeHTML(year)}">${escapeHTML(year)}</option>`
    ).join('');
    select.value = years.includes(selected) ? selected : 'ALL';
}

export function entryLines(entry) {
    if (Array.isArray(entry.lines)) return entry.lines;
    return [
        { type: 'Debit', accountCode: entry.debitCode, accountTitle: entry.debitAcc, amount: Number(entry.debitAmount) },
        { type: 'Credit', accountCode: entry.creditCode, accountTitle: entry.creditAcc, amount: Number(entry.creditAmount) }
    ];
}
