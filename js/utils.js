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
