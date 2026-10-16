/* Tab switching (single-page views) */
import { emitChange } from './state.js';

export function switchTab(tabId) {
    const tabs = ['dashboard', 'suppliers', 'ingredients', 'journal', 'ledger', 'trial-balance', 'income-statement', 'balance-sheet', 'profile', 'settings', 'recovery', 'audit-trail'];

    tabs.forEach(tab => {
        const viewSection = document.getElementById(`${tab}-view`);
        const navBtn = document.getElementById(`nav-${tab}`);
        if (navBtn) {
            if (tab === tabId) navBtn.setAttribute('aria-current', 'page');
            else navBtn.removeAttribute('aria-current');
        }

        viewSection.classList.toggle('hidden', tab !== tabId);
        navBtn?.classList.toggle('nav-active', tab === tabId);
    });

    // Set Title dynamically
    const titleMap = {
        'dashboard': 'Your business, at a glance.',
        'suppliers': 'Supplier directory',
        'ingredients': 'Ingredients',
        'journal': 'General Journal',
        'ledger': 'General Ledger',
        'trial-balance': 'Trial Balance Summary Worksheet',
        'income-statement': 'Income & Expenditure Statement',
        'balance-sheet': 'Statement of Financial Position',
        'profile': 'My Profile',
        'settings': 'Account Setting',
        'recovery': 'Backup & Recovery',
        'audit-trail': 'Audit Trail'
    };
    document.getElementById('page-title').innerText = titleMap[tabId] || 'Business Ledger';
    const headerCopy = {
        ingredients: ['Kitchen inventory', 'Manage ingredient stock, supplier details, and reorder settings.'],
        suppliers: ['Procurement network', 'Maintain the contacts and delivery details that keep catering operations moving.'],
        journal: ['Book of original entry', 'Transactions recorded in standard split peso and cent format.'],
        ledger: ['Accounting records', 'Individual T-Account record of secondary entries.'],
        profile: ['Team account', 'Your identity and access details for this workspace.'],
        settings: ['Account preferences', 'Review the information and sign-in methods associated with your account.'],
        recovery: ['Recover records', 'Restore deleted ingredients, catering events, voided journal entries, and archived suppliers.'],
        'audit-trail': ['Activity log', 'A timestamped history of changes to restaurant and accounting records.']
    };
    const [eyebrow, subtitle] = headerCopy[tabId] || [
        'Compañero Rafon · Operations',
        'Live accounting, supplier management, and catering performance in one unified workspace.'
    ];
    document.querySelector('#header-root .header-eyebrow').textContent = eyebrow;
    document.getElementById('page-subtitle').textContent = subtitle;
    document.getElementById('add-ingredient').classList.toggle('hidden', tabId !== 'ingredients');
    document.getElementById('add-supplier').classList.toggle('hidden', tabId !== 'suppliers');
    document.getElementById('header-status').classList.toggle('hidden', ['ingredients', 'suppliers', 'profile', 'settings', 'recovery', 'audit-trail'].includes(tabId));

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
    const availableTabs = ['dashboard', 'suppliers', 'ingredients', 'journal', 'ledger', 'trial-balance', 'income-statement', 'balance-sheet', 'profile', 'settings', 'recovery', 'audit-trail'];
    switchTab(requestedTab && availableTabs.includes(requestedTab) ? requestedTab : 'dashboard');
}
