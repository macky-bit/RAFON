import { loadTemplate } from '../loader.js';
import { loadState, emitChange } from '../state.js';
import { escapeHTML } from '../utils.js';
import { confirmAction } from '../confirmAction.js';

const labels = { ingredient: 'Ingredient', journal: 'Journal entry' };
const statuses = { ingredient: 'Deleted', journal: 'Deleted' };
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
    const visible = records.filter(record =>
        (!query || record.name.toLowerCase().includes(query)) &&
        (!type || record.type === type)
    );
    const params = new URLSearchParams({ action: 'download' });
    if (query) params.set('search', query);
    if (type) params.set('type', type);
    document.getElementById('recovery-download').href = `api/recovery.php?${params}`;
    document.getElementById('recovery-count').textContent = `Showing ${visible.length} of ${records.length} recoverable record${records.length === 1 ? '' : 's'}`;
    body.innerHTML = visible.length ? visible.map(record => `<tr>
        <td><strong>${escapeHTML(record.name)}</strong></td>
        <td>${labels[record.type]}</td>
        <td>${statuses[record.type]}</td>
        <td>${escapeHTML(record.changedAt || '—')}</td>
        <td><div class="recovery-row-actions"><button type="button" class="recovery-restore" data-type="${record.type}" data-id="${record.id}" aria-label="Restore ${escapeHTML(record.name)}">Restore</button><button type="button" class="recovery-delete" data-type="${record.type}" data-id="${record.id}" aria-label="Permanently delete ${escapeHTML(record.name)}">Permanently delete</button></div></td>
    </tr>`).join('') : `<tr><td colspan="5" class="recovery-empty">${records.length ? 'No records match these filters.' : 'No deleted records.'}</td></tr>`;
}

export async function refresh() {
    const body = document.getElementById('recovery-table-body');
    if (!body) return;
    try {
        const response = await fetch('api/recovery.php', { cache: 'no-store' });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || `Request failed (${response.status}).`);
        records = (payload.records || []).filter(record => Object.hasOwn(labels, record.type));
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
    document.getElementById('recovery-type')?.addEventListener('change', render);
    document.getElementById('recovery-table-body')?.addEventListener('click', async event => {
        const button = event.target.closest('.recovery-restore, .recovery-delete');
        if (!button || button.disabled) return;
        const record = records.find(item => item.type === button.dataset.type && item.id === Number(button.dataset.id));
        if (!record) return;
        const deleting = button.classList.contains('recovery-delete');
        const description = `${labels[record.type].toLowerCase()} "${record.name}"`;
        const confirmed = deleting
            ? await confirmAction({
                title: `Permanently delete ${description}?`,
                message: 'This cannot be undone. The record will also be removed from future recovery backups.',
                action: 'Permanently delete',
                trigger: button
            })
            : window.confirm(`Restore ${description}?`);
        if (!confirmed) return;
        const rowButtons = button.closest('tr').querySelectorAll('button');
        rowButtons.forEach(action => { action.disabled = true; });
        try {
            const response = await fetch('api/recovery.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: deleting ? 'delete' : 'restore', type: record.type, id: record.id,
                    csrfToken: document.querySelector('meta[name="csrf-token"]')?.content || '' })
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(payload.error || `Request failed (${response.status}).`);
            records = records.filter(item => item !== record);
            render();
            showFeedback(`${labels[record.type]} "${record.name}" ${deleting ? 'permanently deleted' : 'restored'}.`);
        } catch (error) {
            rowButtons.forEach(action => { action.disabled = false; });
            showFeedback(`Could not ${deleting ? 'permanently delete' : 'restore'} the record: ${error.message}`, true);
            return;
        }
        try {
            await loadState();
            emitChange();
        } catch (error) {
            showFeedback(`Record ${deleting ? 'permanently deleted' : 'restored'}. Refresh the page to update the other views: ${error.message}`, true);
        }
    });
}
