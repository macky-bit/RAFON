/* Executive Dashboard: metric cards + recent activity */
import { loadTemplate } from '../loader.js';
import {
    cateringEvents,
    chartOfAccounts,
    deleteCateringEvent,
    journalEntries,
    saveCateringEvent
} from '../state.js';
import { entryLines, escapeHTML, formatPHP } from '../utils.js';
import { confirmAction } from '../confirmAction.js';

export async function mount(parent) {
    parent.insertAdjacentHTML('beforeend', await loadTemplate('overview'));
}

function accountTotals() {
    return chartOfAccounts.map(account => {
        let debit = 0;
        let credit = 0;
        journalEntries.forEach(entry => {
            for (const line of entryLines(entry)) {
                if (String(line.accountCode) !== String(account.code)) continue;
                if (line.type === 'Debit') debit += Number(line.amount) || 0;
                else credit += Number(line.amount) || 0;
            }
        });
        const balance = ['Asset', 'Expense'].includes(account.category) ? debit - credit : credit - debit;
        return { ...account, debit, credit, balance };
    });
}

function setMoney(id, amount, trackNegative = false) {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = formatPHP(amount);
    element.classList.toggle('negative-value', trackNegative && amount < 0);
}

function renderFinancialSummary(totals) {
    const sumCategory = category => totals
        .filter(item => item.category === category)
        .reduce((sum, item) => sum + item.balance, 0);
    const revenue = sumCategory('Revenue');
    const expenses = sumCategory('Expense');
    const receivables = totals.find(item => item.title === 'Accounts Receivable')
        || totals.find(item => ['102', '120'].includes(String(item.code)));
    const cash = totals.find(item => item.title === 'Cash on Hand & Bank')
        || totals.find(item => ['101', '110'].includes(String(item.code)));

    setMoney('dash-revenue', revenue);
    setMoney('dash-expenses', expenses);
    setMoney('dash-net-income', revenue - expenses, true);
    setMoney('dash-receivables', receivables?.balance || 0);
    setMoney('dash-cash-balance', cash?.balance || 0);
    setMoney('dash-cash-received', cash?.debit || 0);
    setMoney('dash-cash-paid', cash?.credit || 0);
    setMoney('dash-net-cash', (cash?.debit || 0) - (cash?.credit || 0), true);
}

function renderPerformanceChart() {
    const container = document.getElementById('performance-chart');
    if (!container) return;
    const accountCategory = new Map(chartOfAccounts.map(account => [String(account.code), account.category]));
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, offset) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (5 - offset), 1);
        return {
            key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
            label: date.toLocaleDateString('en-US', { month: 'short' }),
            revenue: 0,
            expenses: 0
        };
    });
    const byMonth = new Map(months.map(month => [month.key, month]));
    journalEntries.forEach(entry => {
        const month = byMonth.get(String(entry.date || '').slice(0, 7));
        if (!month) return;
        for (const line of entryLines(entry)) {
            const category = accountCategory.get(String(line.accountCode));
            if (category === 'Revenue') month.revenue += (line.type === 'Credit' ? 1 : -1) * Number(line.amount);
            if (category === 'Expense') month.expenses += (line.type === 'Debit' ? 1 : -1) * Number(line.amount);
        }
    });
    const maximum = Math.max(...months.flatMap(month => [month.revenue, month.expenses]), 1);
    container.innerHTML = months.map(month => `
        <div class="chart-month">
            <div class="bar-pair">
                <button type="button" class="chart-bar revenue-bar" style="height:${Math.max((month.revenue / maximum) * 100, month.revenue ? 4 : 1)}%" data-tooltip="${month.label} revenue: ${formatPHP(month.revenue)}" aria-label="${month.label} revenue: ${formatPHP(month.revenue)}"></button>
                <button type="button" class="chart-bar expense-bar" style="height:${Math.max((month.expenses / maximum) * 100, month.expenses ? 4 : 1)}%" data-tooltip="${month.label} expenses: ${formatPHP(month.expenses)}" aria-label="${month.label} expenses: ${formatPHP(month.expenses)}"></button>
            </div>
            <span>${month.label}</span>
        </div>
    `).join('');
}

function renderExpenseBreakdown(totals) {
    const container = document.getElementById('expense-breakdown');
    if (!container) return;
    const expenses = totals
        .filter(item => item.category === 'Expense' && item.balance > 0)
        .sort((a, b) => b.balance - a.balance);
    const maximum = Math.max(...expenses.map(item => item.balance), 0);

    if (!expenses.length) {
        container.innerHTML = '<p class="dashboard-empty-state">No posted expense entries yet.</p>';
        return;
    }

    container.innerHTML = expenses.map((item, index) => `
        <div class="expense-row" role="listitem">
            <span class="expense-rank">${String(index + 1).padStart(2, '0')}</span>
            <div class="expense-detail">
                <div><strong>${escapeHTML(item.title)}</strong><span>${formatPHP(item.balance)}</span></div>
                <div class="expense-track" aria-hidden="true"><i style="width:${(item.balance / maximum) * 100}%"></i></div>
            </div>
        </div>
    `).join('');
}

function eventStatusClass(status) {
    return `event-status event-status-${String(status).toLowerCase()}`;
}

export function effectiveEventStatus(event, today = todayValue()) {
    return event.status === 'Cancelled' ? 'Cancelled' : event.eventDate < today ? 'Completed' : 'Upcoming';
}

function renderCateringEvents() {
    const displayedEvents = cateringEvents.map(event => ({ ...event, status: effectiveEventStatus(event) }));
    const activeEvents = displayedEvents.filter(event => event.status !== 'Cancelled');
    const now = new Date();
    const thisMonth = activeEvents.filter(event => {
        const date = new Date(`${event.eventDate}T00:00:00`);
        return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    });
    const revenue = activeEvents.reduce((sum, event) => sum + Number(event.totalRevenue || 0), 0);
    const unpaid = activeEvents
        .filter(event => event.status === 'Upcoming')
        .reduce((sum, event) => sum + Math.max(Number(event.totalRevenue || 0) - Number(event.amountPaid || 0), 0), 0);
    const packages = new Map();
    activeEvents.forEach(event => {
        const profit = Number(event.totalRevenue || 0) - Number(event.estimatedCost || 0);
        packages.set(event.packageName, (packages.get(event.packageName) || 0) + profit);
    });
    const topPackage = [...packages.entries()].sort((a, b) => b[1] - a[1])[0];

    document.getElementById('event-month-count').textContent = String(thisMonth.length);
    setMoney('event-total-revenue', revenue);
    setMoney('event-unpaid-balance', unpaid);
    document.getElementById('event-top-package').textContent = topPackage ? topPackage[0] : 'No data yet';

    const table = document.getElementById('catering-events-table');
    if (!displayedEvents.length) {
        table.innerHTML = '<tr><td colspan="5" class="dashboard-empty-state">No events yet. Add your first catering booking.</td></tr>';
        return;
    }

    table.innerHTML = displayedEvents.map(event => {
        return `<tr>
            <td><strong>${escapeHTML(event.eventName)}</strong><small>${escapeHTML(event.clientName)} · ${escapeHTML(event.packageName)}</small></td>
            <td>${escapeHTML(event.eventDate)}</td>
            <td><span class="${eventStatusClass(event.status)}">${escapeHTML(event.status)}</span></td>
            <td class="amount-column mono">${formatPHP(event.totalRevenue)}</td>
            <td><div class="event-row-actions"><button type="button" data-action="edit-event" data-id="${event.id}" aria-label="Edit ${escapeHTML(event.eventName)}"><i class="fa-solid fa-pen"></i></button><button type="button" data-action="delete-event" data-id="${event.id}" aria-label="Delete ${escapeHTML(event.eventName)}"><i class="fa-solid fa-trash"></i></button></div></td>
        </tr>`;
    }).join('');
}

function renderRecentEntries() {
    const table = document.getElementById('dash-recent-table');
    if (!table) return;
    const entries = [...journalEntries].reverse().slice(0, 5);
    if (!entries.length) {
        table.innerHTML = '<tr><td colspan="5" class="dashboard-empty-state">No entries yet. Open General Journal to record your first transaction.</td></tr>';
        return;
    }
    table.innerHTML = entries.map(entry => {
        const lines = entryLines(entry);
        const titles = lines.map(line => line.accountTitle).join(' / ');
        const debit = lines.filter(line => line.type === 'Debit').reduce((sum, line) => sum + Number(line.amount), 0);
        const credit = lines.filter(line => line.type === 'Credit').reduce((sum, line) => sum + Number(line.amount), 0);
        return `<tr>
        <td class="py-3 px-4">${escapeHTML(entry.date)}</td>
        <td class="py-3 px-4"><strong>${escapeHTML(titles)}</strong><small class="dashboard-table-note">${escapeHTML(entry.explanation)}</small></td>
        <td class="py-3 px-4 mono">${escapeHTML(entry.ref)}</td>
        <td class="py-3 px-4 amount-column mono">${formatPHP(debit)}</td>
        <td class="py-3 px-4 amount-column mono">${formatPHP(credit)}</td>
    </tr>`;
    }).join('');
}

export function render() {
    const totals = accountTotals();
    renderFinancialSummary(totals);
    renderPerformanceChart();
    renderExpenseBreakdown(totals);
    renderCateringEvents();
    renderRecentEntries();
}

function todayValue() {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const date = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return `${date.year}-${date.month}-${date.day}`;
}

function refreshEventsAtMidnight() {
    const [year, month, day] = todayValue().split('-').map(Number);
    const nextMidnight = Date.UTC(year, month - 1, day + 1) - 8 * 60 * 60 * 1000;
    setTimeout(() => {
        renderCateringEvents();
        refreshEventsAtMidnight();
    }, Math.max(1000, nextMidnight - Date.now()));
}

function openEventModal(event = null) {
    document.getElementById('catering-event-form').reset();
    document.getElementById('catering-event-error').classList.add('hidden');
    document.getElementById('event-id').value = event?.id || '';
    document.getElementById('event-name').value = event?.eventName || '';
    document.getElementById('event-client').value = event?.clientName || '';
    document.getElementById('event-package').value = event?.packageName || '';
    document.getElementById('event-date').value = event?.eventDate || todayValue();
    document.getElementById('event-revenue').value = event?.totalRevenue ?? 0;
    document.getElementById('event-cost').value = event?.estimatedCost ?? 0;
    document.getElementById('event-paid').value = event?.amountPaid ?? 0;
    document.getElementById('event-notes').value = event?.notes || '';
    document.getElementById('catering-event-modal-title').textContent = event ? 'Edit catering event' : 'Add catering event';
    document.getElementById('catering-event-modal').showModal();
    document.getElementById('event-name').focus();
}

function closeEventModal() {
    document.getElementById('catering-event-modal').close();
}

async function handleEventSubmit(submitEvent) {
    submitEvent.preventDefault();
    const error = document.getElementById('catering-event-error');
    error.classList.add('hidden');
    const id = Number(document.getElementById('event-id').value) || null;
    const event = {
        eventName: document.getElementById('event-name').value,
        clientName: document.getElementById('event-client').value,
        packageName: document.getElementById('event-package').value,
        eventDate: document.getElementById('event-date').value,
        totalRevenue: Number(document.getElementById('event-revenue').value),
        estimatedCost: Number(document.getElementById('event-cost').value),
        amountPaid: Number(document.getElementById('event-paid').value),
        notes: document.getElementById('event-notes').value
    };
    const button = submitEvent.submitter;
    if (button) button.disabled = true;
    try {
        await saveCateringEvent(event, id);
        closeEventModal();
    } catch (requestError) {
        error.textContent = `Could not save the event: ${requestError.message}`;
        error.classList.remove('hidden');
    } finally {
        if (button) button.disabled = false;
    }
}

async function handleEventTableClick(clickEvent) {
    const button = clickEvent.target.closest('[data-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    const event = cateringEvents.find(item => item.id === id);
    if (!event) return;
    if (button.dataset.action === 'edit-event') {
        openEventModal(event);
        return;
    }
    if (!await confirmAction({ title: 'Delete catering event?', message: `${event.eventName} will be deleted.`, trigger: button })) return;
    button.disabled = true;
    try {
        await deleteCateringEvent(id);
    } catch (error) {
        window.alert(`Could not delete the event: ${error.message}`);
        button.disabled = false;
    }
}

export function bindEvents() {
    refreshEventsAtMidnight();
    const faqToggle = document.getElementById('dashboard-faq-toggle');
    const faqPanel = document.getElementById('dashboard-faq-panel');
    const closeFaq = () => {
        faqPanel.hidden = true;
        faqToggle.setAttribute('aria-expanded', 'false');
        faqToggle.focus();
    };
    faqToggle.addEventListener('click', () => {
        faqPanel.hidden = !faqPanel.hidden;
        faqToggle.setAttribute('aria-expanded', String(!faqPanel.hidden));
    });
    document.getElementById('dashboard-faq-close').addEventListener('click', closeFaq);
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !faqPanel.hidden) closeFaq();
    });
    document.getElementById('add-catering-event').addEventListener('click', () => openEventModal());
    document.querySelectorAll('.js-close-event-modal').forEach(button => button.addEventListener('click', closeEventModal));
    document.getElementById('catering-event-form').addEventListener('submit', handleEventSubmit);
    document.getElementById('catering-events-table').addEventListener('click', handleEventTableClick);
    document.getElementById('catering-event-modal').addEventListener('click', event => {
        if (event.target === event.currentTarget) closeEventModal();
    });
}
