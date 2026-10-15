/* Tab switching (single-page views) */
import { emitChange } from './state.js';

export function switchTab(tabId) {
    const tabs = ['dashboard', 'suppliers', 'journal', 'ledger', 'trial-balance', 'income-statement', 'balance-sheet', 'audit-trail'];

    tabs.forEach(tab => {
        const viewSection = document.getElementById(`${tab}-view`);
        const navBtn = document.getElementById(`nav-${tab}`);
        if (navBtn) {
            if (tab === tabId) navBtn.setAttribute('aria-current', 'page');
            else navBtn.removeAttribute('aria-current');
        }

        if (tab === tabId) {
            viewSection.classList.remove('hidden');
            if (navBtn) {
                navBtn.className = "nav-item nav-active";
            }
        } else {
            viewSection.classList.add('hidden');
            if (navBtn) {
                navBtn.className = "nav-item";
            }
        }
    });

    // Set Title dynamically
    const titleMap = {
        'dashboard': 'Your business, at a glance.',
        'suppliers': 'Supplier Contacts',
        'journal': 'General Journal (Book of Original Entry)',
        'ledger': 'General Ledger (T-Accounts)',
        'trial-balance': 'Trial Balance Summary Worksheet',
        'income-statement': 'Income & Expenditure Statement',
        'balance-sheet': 'Statement of Financial Position',
        'audit-trail': 'System Security & Audit Trail'
    };
    document.getElementById('page-title').innerText = titleMap[tabId] || 'Business Ledger';
    document.querySelector('#header-root > header')?.classList.toggle('hidden', tabId === 'suppliers');

    document.getElementById('content-area')?.focus({ preventScroll: true });

    // Re-render components upon view switch
    emitChange();
}

// Wire every [data-tab] button (sidebar items + "View Full Journal" link)
export function initNavigation() {
    document.querySelectorAll('[data-tab]').forEach(button => {
        button.addEventListener('click', () => {
            history.replaceState(null, '', `#${button.dataset.tab}`);
            switchTab(button.dataset.tab);
        });
    });

    const requestedTab = window.location.hash.slice(1);
    const availableTabs = ['dashboard', 'suppliers', 'journal', 'ledger', 'trial-balance', 'income-statement', 'balance-sheet', 'audit-trail'];
    switchTab(requestedTab && availableTabs.includes(requestedTab) ? requestedTab : 'dashboard');
}
