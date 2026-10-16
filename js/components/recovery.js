import { loadTemplate } from '../loader.js';
import { loadState, emitChange } from '../state.js';
import { escapeHTML } from '../utils.js';

const labels = { ingredient: 'Ingredient', event: 'Catering event', journal: 'Journal entry', supplier: 'Supplier' };
const statuses = { ingredient: 'Deleted', event: 'Deleted', journal: 'Voided', supplier: 'Archived' };
let records = [];

export async function mount(parent) {
    parent.insertAdjacentHTML('beforeend', await loadTemplate('recovery'));
}

function showFeedback(message, error = false) {
    const feedback = document.getElementById('recovery-feedback');
    feedback.textContent = message;
    feedback.classList.remove('hidden');
    feedback.classList.toggle('recovery-error', error);
}

function render() {
    const body = document.getElementById('recovery-table-body');
    const query = document.getElementById('recovery-search').value.trim().toLowerCase();
    const type = document.getElementById('recovery-type').value;
    const status = document.getElementById('recovery-status').value;
    const visible = records.filter(record =>
        (!query || record.name.toLowerCase().includes(query)) &&
        (!type || record.type === type) &&
        (!status || statuses[record.type].toLowerCase() === status)
    );
    const params = new URLSearchParams({ action: 'download' });
    if (query) params.set('search', query);
    if (type) params.set('type', type);
    if (status) params.set('status', status);
    document.getElementById('recovery-download').href = `api/recovery.php?${params}`;
    document.getElementById('recovery-count').textContent = `Showing ${visible.length} of ${records.length} recoverable record${records.length === 1 ? '' : 's'}`;
    body.innerHTML = visible.length ? visible.map(record => `<tr>
        <td><strong>${escapeHTML(record.name)}</strong></td>
        <td>${labels[record.type]}</td>
        <td>${statuses[record.type]}</td>
        <td>${escapeHTML(record.changedAt || '—')}</td>
        <td><button type="button" class="recovery-restore" data-type="${record.type}" data-id="${record.id}" aria-label="Restore ${escapeHTML(record.name)}">Restore</button></td>
    </tr>`).join('') : `<tr><td colspan="5" class="recovery-empty">${records.length ? 'No records match these filters.' : 'No deleted or archived records to restore.'}</td></tr>`;
}

export async function refresh() {
    const body = document.getElementById('recovery-table-body');
    if (!body) return;
    try {
        const response = await fetch('api/recovery.php', { cache: 'no-store' });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || `Request failed (${response.status}).`);
        records = payload.records || [];
        render();
    } catch (error) {
        body.innerHTML = '<tr><td colspan="5" class="recovery-empty">Could not load recoverable records.</td></tr>';
        showFeedback(error.message, true);
    }
}

export function bindEvents() {
    document.getElementById('nav-recovery')?.addEventListener('click', refresh);
    document.getElementById('recovery-refresh')?.addEventListener('click', refresh);
    document.getElementById('recovery-search')?.addEventListener('input', render);
    ['recovery-type', 'recovery-status'].forEach(id => document.getElementById(id)?.addEventListener('change', render));
    document.getElementById('recovery-table-body')?.addEventListener('click', async event => {
        const button = event.target.closest('.recovery-restore');
        if (!button || button.disabled) return;
        const record = records.find(item => item.type === button.dataset.type && item.id === Number(button.dataset.id));
        if (!record || !window.confirm(`Restore ${labels[record.type].toLowerCase()} "${record.name}"?`)) return;
        button.disabled = true;
        try {
            const response = await fetch('api/recovery.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: record.type, id: record.id })
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(payload.error || `Request failed (${response.status}).`);
            records = records.filter(item => item !== record);
            render();
            showFeedback(`${labels[record.type]} "${record.name}" restored.`);
        } catch (error) {
            button.disabled = false;
            showFeedback(`Could not restore the record: ${error.message}`, true);
            return;
        }
        try {
            await loadState();
            emitChange();
        } catch (error) {
            showFeedback(`Record restored. Refresh the page to update the other views: ${error.message}`, true);
        }
    });
}
