/* Shared database-backed state + tiny change-notification bus. */

export const chartOfAccounts = [];
export const journalEntries = [];
export const auditLogs = [];
export const cateringEvents = [];
export const suppliers = [];

const listeners = [];

export function onChange(fn) {
    listeners.push(fn);
}

export function emitChange() {
    listeners.forEach(fn => fn());
}

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(payload.error || `Database request failed (${response.status}).`);
    }

    return payload;
}

export async function loadState() {
    const accountingData = await apiRequest('api/accounting.php');
    chartOfAccounts.splice(0, chartOfAccounts.length, ...(accountingData.chartOfAccounts || []));
    journalEntries.splice(0, journalEntries.length, ...(accountingData.journalEntries || []));
    auditLogs.splice(0, auditLogs.length, ...(accountingData.auditLogs || []));

    try {
        const cateringData = await apiRequest('api/catering_events.php');
        cateringEvents.splice(0, cateringEvents.length, ...(cateringData.events || []));
    } catch (error) {
        console.warn('Catering events are unavailable until the new SQL schema is run.', error);
        cateringEvents.splice(0, cateringEvents.length);
    }

    try {
        const supplierData = await apiRequest('api/suppliers.php');
        suppliers.splice(0, suppliers.length, ...(supplierData.suppliers || []));
    } catch (error) {
        console.warn('Suppliers are unavailable until the new SQL schema is run.', error);
        suppliers.splice(0, suppliers.length);
    }
}

export async function postEntry(entry) {
    const result = await apiRequest('api/accounting.php', {
        method: 'POST',
        body: JSON.stringify(entry)
    });

    journalEntries.push(result.entry);
    auditLogs.push(result.auditLog);
    emitChange();
    return result.entry;
}

export async function saveCateringEvent(event, id = null) {
    const result = await apiRequest('api/catering_events.php', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(id ? { ...event, id } : event)
    });

    if (id) {
        const index = cateringEvents.findIndex(item => item.id === id);
        if (index >= 0) {
            cateringEvents.splice(index, 1, result.event);
        }
    } else {
        cateringEvents.unshift(result.event);
    }
    emitChange();
    return result.event;
}

export async function deleteCateringEvent(id) {
    await apiRequest('api/catering_events.php', {
        method: 'DELETE',
        body: JSON.stringify({ id })
    });
    const index = cateringEvents.findIndex(item => item.id === id);
    if (index >= 0) {
        cateringEvents.splice(index, 1);
    }
    emitChange();
}

export async function saveSupplier(supplier, id = null) {
    const result = await apiRequest('api/suppliers.php', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(id ? { ...supplier, id } : supplier)
    });

    if (id) {
        const index = suppliers.findIndex(item => item.id === id);
        if (index >= 0) {
            suppliers.splice(index, 1, result.supplier);
        }
    } else {
        suppliers.unshift(result.supplier);
    }
    emitChange();
    return result.supplier;
}

export async function setSupplierStatus(id, status) {
    const result = await apiRequest('api/suppliers.php', {
        method: 'PATCH',
        body: JSON.stringify({ id, status })
    });
    const index = suppliers.findIndex(item => item.id === id);
    if (index >= 0) {
        suppliers.splice(index, 1, result.supplier);
    }
    emitChange();
    return result.supplier;
}
