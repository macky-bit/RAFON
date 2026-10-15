/* Audit Trail */
import { loadTemplate } from '../loader.js';
import { auditLogs } from '../state.js';
import { escapeHTML } from '../utils.js';

export async function mount(parent) {
    parent.insertAdjacentHTML('beforeend', await loadTemplate('auditTrail'));
}

// Render Audit Logs
export function render() {
    const tbody = document.getElementById('audit-trail-body');
    tbody.innerHTML = '';
    document.getElementById('audit-record-count').textContent = `${auditLogs.length} record${auditLogs.length === 1 ? '' : 's'}`;

    [...auditLogs].reverse().forEach(log => {
        tbody.innerHTML += `
            <tr>
                <td class="py-3 px-4 font-mono text-slate-500">${escapeHTML(log.timestamp)}</td>
                <td class="py-3 px-4 font-semibold text-slate-800">${escapeHTML(log.user)}</td>
                <td class="py-3 px-4 font-mono text-emerald-600">${escapeHTML(log.ref)}</td>
                <td class="py-3 px-4 text-slate-600">${escapeHTML(log.action)}: ${escapeHTML(log.detail)}</td>
                <td class="py-3 px-4">
                    <span class="audit-status">${escapeHTML(log.status)}</span>
                </td>
            </tr>
        `;
    });
    if (!tbody.children.length) tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No activity has been recorded yet.</td></tr>';

}
