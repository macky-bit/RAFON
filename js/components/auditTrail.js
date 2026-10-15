/* Audit Trail */
import { loadTemplate } from '../loader.js';import { auditLogs } from '../state.js';

export async function mount(parent) {
    parent.insertAdjacentHTML('beforeend', await loadTemplate('auditTrail'));
}

// Render Audit Logs
export function render() {
    const tbody = document.getElementById('audit-trail-body');
    tbody.innerHTML = '';

    [...auditLogs].reverse().forEach(log => {
        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 text-xs">
                <td class="py-3 px-4 font-mono text-slate-500">${log.timestamp}</td>
                <td class="py-3 px-4 font-semibold text-slate-800">${log.user}</td>
                <td class="py-3 px-4 font-mono text-emerald-600">${log.ref}</td>
                <td class="py-3 px-4 text-slate-600">${log.action}: ${log.detail}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">${log.status}</span>
                </td>
            </tr>
        `;
    });
    if (!tbody.children.length) tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No accounting activity has been recorded yet.</td></tr>';

}
