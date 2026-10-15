/* Entry point: mounts every component, wires events, first render */
import { loadState, onChange } from './state.js';
import { initNavigation } from './router.js';

import * as sidebar from './components/sidebar.js';
import * as header from './components/header.js';
import * as dashboard from './components/dashboard.js';
import * as suppliers from './components/suppliers.js';
import * as ingredients from './components/ingredients.js';
import * as journal from './components/journal.js';
import * as ledger from './components/ledger.js';
import * as trialBalance from './components/trialBalance.js';
import * as incomeStatement from './components/incomeStatement.js';
import * as balanceSheet from './components/balanceSheet.js';
import * as auditTrail from './components/auditTrail.js';
import * as postModal from './components/postModal.js';

// Refresh all accounting views & data dependencies
function refreshAllViews() {
    suppliers.render();
    ingredients.render();
    journal.render();
    ledger.render();
    trialBalance.render();
    incomeStatement.render();
    balanceSheet.render();
    dashboard.render();
    auditTrail.render();
}

// 1) Mount markup: each component fetches its own components/*.php view.
//    Views are awaited in order so the DOM structure is deterministic.
async function init() {
    const content = document.getElementById('content-area');

    await Promise.all([
        sidebar.mount(document.getElementById('sidebar-root')),
        header.mount(document.getElementById('header-root'))
    ]);
    document.getElementById('view-loading')?.remove();

    for (const view of [dashboard, suppliers, ingredients, journal, ledger, trialBalance, incomeStatement, balanceSheet, auditTrail]) {
        await view.mount(content);
    }
    await postModal.mount(document.getElementById('modal-root'));

    // 2) Wire events before database loading so navigation stays usable
    // even when the local database is offline or slow.
    initNavigation();
    sidebar.bindEvents();
    header.bindEvents({ onNewEntry: postModal.openModal });
    dashboard.bindEvents();
    suppliers.bindEvents();
    ingredients.bindEvents();
    journal.bindEvents();
    ledger.bindEvents();
    postModal.bindEvents();

    // 3) Re-render whenever state changes (new posting, tab switch)
    onChange(refreshAllViews);

    // 4) Paint database-backed empty states immediately.
    refreshAllViews();

    // 5) Load records and replace the empty states with live data.
    try {
        await loadState();
    } catch (error) {
        console.error(error);
        alert(`Could not load the database: ${error.message}`);
        return;
    }

    ledger.populateFilter();
    postModal.populateOptions();
    refreshAllViews();
}

init().catch(error => {
    console.error(error);
    const content = document.getElementById('content-area');
    if (!content) return;
    content.innerHTML = `
        <div class="view-error" role="alert">
            <span><i class="fa-solid fa-triangle-exclamation"></i></span>
            <div>
                <strong>The workspace could not finish loading.</strong>
                <p>${error.message}</p>
                <button type="button" onclick="window.location.reload()">Reload components</button>
            </div>
        </div>
    `;
});
