// Run with the PHP server on port 8000: node tests/ui-smoke.mjs
// Uses an installed Chromium, or CHROME_PATH, Node 22+, and the local MySQL client.
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const cache = join(process.env.LOCALAPPDATA, 'ms-playwright');
const chrome = process.env.CHROME_PATH || join(cache,
    readdirSync(cache).find(name => name.startsWith('chromium-')), 'chrome-win64', 'chrome.exe');
const artifacts = mkdtempSync(join(tmpdir(), 'rafon-ui-'));
const testEmail = `ui-smoke-${Date.now()}@example.test`;
const testJournalRef = `UI-JOURNAL-${Date.now()}`;
const testPassword = 'TestPassword123';
const mysql = process.env.MYSQL_PATH || 'D:\\xammp\\mysql\\bin\\mysql.exe';
const browser = spawn(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu',
    '--remote-debugging-port=9224', `--user-data-dir=${join(artifacts, 'profile')}`,
    '--no-first-run', 'about:blank'], { windowsHide: true, stdio: 'ignore' });
let socket;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
    let tabs;
    for (let i = 0; i < 50; i++) {
        try { tabs = await (await fetch('http://127.0.0.1:9224/json')).json(); break; }
        catch { await pause(100); }
    }
    assert.ok(tabs, 'Chromium must start');
    socket = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
    await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
    let id = 0;
    const pending = new Map();
    socket.addEventListener('message', ({ data }) => {
        const result = JSON.parse(data);
        if (pending.has(result.id)) {
            const { resolve, reject } = pending.get(result.id);
            pending.delete(result.id);
            result.error ? reject(new Error(result.error.message)) : resolve(result.result);
        }
    });
    const call = (method, params = {}) => new Promise((resolve, reject) => {
        pending.set(++id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
    });
    const evaluate = async expression => {
        const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
        assert.ok(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
        return result.result.value;
    };
    await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await call('Page.navigate', { url: 'http://127.0.0.1:8000' });
    let ready = false;
    for (let i = 0; i < 100; i++) {
        ready = await evaluate(`!!document.querySelector('#login-form')`);
        if (ready) break;
        await pause(200);
    }
    assert.ok(ready, 'Unauthenticated Home and login form must load');
    assert.equal(await evaluate(`document.querySelectorAll('#home-view h1').length`), 1, 'Landing page has one primary heading');
    assert.ok(await evaluate(`Array.from(document.querySelectorAll('.auth-form input')).every(input => input.labels.length)`), 'Auth inputs have labels');
    assert.ok(await evaluate(`Array.from(document.querySelectorAll('.auth-card button')).filter(button => button.offsetParent !== null).every(button => { const box = button.getBoundingClientRect(); return box.width >= 24 && box.height >= 24; })`), 'Visible auth buttons meet the minimum target size');
    for (let i = 0; i < 20; i++) {
        await evaluate(`document.querySelector('#auth-login-tab').focus(); document.querySelector('#auth-login-tab').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))`);
        if (await evaluate(`document.activeElement.id === 'auth-register-tab'`)) break;
        await pause(100);
    }
    assert.equal(await evaluate(`document.activeElement.id`), 'auth-register-tab', 'Arrow keys operate the auth tabs');
    await evaluate(`Promise.all([document.fonts.ready, ...Array.from(document.images, image => image.decode().catch(() => {}))])`);
    for (const [width, expectedDishes] of [[1440, 4], [1024, 2], [768, 2], [390, 1], [320, 1]]) {
        await call('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
        const layout = await evaluate(`(() => {
            const hero = document.querySelector('.restaurant-hero').getBoundingClientRect();
            const auth = document.querySelector('.auth-card').getBoundingClientRect();
            return {
                fits: document.documentElement.scrollWidth <= innerWidth,
                beside: Math.abs(hero.top - auth.top) <= 2 && hero.right < auth.left,
                stacked: auth.top >= hero.bottom,
                dishes: getComputedStyle(document.querySelector('.dish-grid')).gridTemplateColumns.split(' ').length
            };
        })()`);
        assert.ok(layout.fits, `Landing page must not overflow at ${width}px`);
        assert.ok(width >= 1024 ? layout.beside : layout.stacked, `Hero/auth composition must reflow at ${width}px`);
        assert.equal(layout.dishes, expectedDishes, `Dish grid columns at ${width}px`);
        writeFileSync(join(artifacts, `landing-${width}.png`), Buffer.from((await call('Page.captureScreenshot', { captureBeyondViewport: true })).data, 'base64'));
    }
    await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await evaluate(`document.querySelector('#auth-register-tab').click()`);
    assert.equal(await evaluate(`document.querySelector('#register-form').classList.contains('hidden')`), false, 'Registration form opens');
    assert.equal(await evaluate(`document.querySelector('#auth-register-tab').getAttribute('aria-selected')`), 'true');
    await pause(100);
    writeFileSync(join(artifacts, 'auth-register-desktop.png'), Buffer.from((await call('Page.captureScreenshot')).data, 'base64'));
    await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 900, deviceScaleFactor: 1, mobile: false });
    assert.ok(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), 'Registration page must not overflow at 390px');
    writeFileSync(join(artifacts, 'auth-register-mobile.png'), Buffer.from((await call('Page.captureScreenshot', { captureBeyondViewport: true })).data, 'base64'));
    await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await evaluate(`document.querySelector('#register-name').value='Test User'; document.querySelector('#register-email').value='${testEmail}'; document.querySelector('#register-password').value='${testPassword}'; document.querySelector('#register-password-confirmation').value='wrong-password'; document.querySelector('#register-form input[type="checkbox"]').checked=true; document.querySelector('#register-form').requestSubmit()`);
    assert.equal(await evaluate(`document.querySelector('#auth-message').classList.contains('auth-message-error')`), true, 'Registration rejects mismatched passwords');
    await evaluate(`document.querySelector('#register-password-confirmation').value='${testPassword}'; document.querySelector('#register-password-confirmation').dispatchEvent(new Event('input', { bubbles: true })); document.querySelector('#register-form').requestSubmit()`);
    for (let i = 0; i < 50; i++) {
        if (await evaluate(`!document.querySelector('#login-form').classList.contains('hidden') && document.querySelector('#auth-message').textContent.includes('Account created')`)) break;
        await pause(100);
    }
    const registrationState = await evaluate(`({ hidden: document.querySelector('#login-form').classList.contains('hidden'), message: document.querySelector('#auth-message').textContent })`);
    assert.equal(registrationState.hidden, false, `Registration returns to login: ${registrationState.message}`);
    await evaluate(`document.querySelector('[data-password-toggle="login-password"]').click()`);
    assert.equal(await evaluate(`document.querySelector('#login-password').type`), 'text', 'Password can be revealed');
    await evaluate(`document.querySelector('[data-password-toggle="login-password"]').click()`);
    await evaluate(`document.querySelector('#login-email').value='${testEmail}'; document.querySelector('#login-password').value='${testPassword}'; document.querySelector('#login-form').requestSubmit()`);
    await pause(500);
    ready = false;
    for (let i = 0; i < 100; i++) {
        try { ready = await evaluate(`!!document.querySelector('#entry-debit-account option[value]:not([value=""])')`); }
        catch { ready = false; }
        if (ready) break;
        await pause(200);
    }
    assert.ok(ready, 'Login must open Dashboard and load chart of accounts');
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('#sidebar')).display`), 'flex', 'Authenticated navigation must load');
    assert.equal(await evaluate(`document.querySelector('#sidebar').tagName`), 'NAV', 'Navigation uses a top bar landmark');
    assert.equal(await evaluate(`document.querySelector('.user-status > .user-initials').tagName`), 'BUTTON', 'Initials open the profile menu');
    assert.ok(await evaluate(`!!document.querySelector('.user-status #profile-submenu')`), 'Profile links sit below the avatar');
    assert.ok(await evaluate(`!!document.querySelector('.top-nav-links > #nav-audit-trail') && !document.querySelector('#profile-submenu #nav-audit-trail')`), 'Audit Trail sits beside Accounting, outside Profile');
    assert.equal(await evaluate(`document.querySelector('#profile-submenu').classList.contains('hidden')`), true, 'Profile menu starts hidden');
    await evaluate(`document.querySelector('.user-initials').click()`);
    assert.equal(await evaluate(`document.querySelector('.user-initials').getAttribute('aria-expanded')`), 'true', 'Avatar opens Profile');
    await evaluate(`document.querySelector('.user-initials').click()`);
    await pause(300);
    assert.equal(await evaluate(`document.querySelector('#profile-submenu').classList.contains('hidden')`), true, 'Avatar closes Profile');
    assert.equal(await evaluate(`document.querySelector('[aria-controls="inventory-submenu"]').getAttribute('aria-expanded')`), 'false', 'Inventory starts collapsed');
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('#inventory-submenu')).visibility`), 'hidden', 'Collapsed submenu is hidden');
    await evaluate(`document.querySelector('[aria-controls="inventory-submenu"]').click()`);
    assert.equal(await evaluate(`document.querySelector('[aria-controls="inventory-submenu"]').getAttribute('aria-expanded')`), 'true', 'Inventory exposes its open state');
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('#inventory-submenu')).visibility`), 'visible', 'Inventory submenu opens');
    await evaluate(`document.querySelector('#nav-ingredients').click()`);
    assert.equal(await evaluate(`document.querySelector('[aria-controls="inventory-submenu"]').getAttribute('aria-expanded')`), 'false', 'Selecting an item closes its submenu');
    await pause(300);
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('#inventory-submenu')).visibility`), 'hidden', 'Inventory submenu retracts');
    assert.ok(await evaluate(`getComputedStyle(document.querySelector('#header-root > header')).display !== 'none'`), 'Ingredients uses the shared header');
    assert.equal(await evaluate(`document.querySelector('#page-title').textContent`), 'Ingredients');
    assert.equal(await evaluate(`document.querySelector('#header-root .header-eyebrow').textContent`), 'Kitchen inventory');
    assert.ok(await evaluate(`!!document.querySelector('#header-root #add-ingredient') && document.querySelector('#add-ingredient').offsetParent !== null`), 'Add ingredient is in the shared header');
    assert.equal(await evaluate(`document.querySelector('#add-supplier').offsetParent`), null, 'Supplier action is hidden on Ingredients');
    await evaluate(`document.querySelector('#add-ingredient').click()`);
    assert.ok(await evaluate(`document.querySelector('#ingredient-settings').open`), 'Add ingredient opens its form');
    assert.ok(await evaluate(`document.querySelector('#ingredient-settings .ingredient-settings-header').classList.contains('supplier-modal-header')`), 'Ingredient form shares the supplier header design');
    assert.equal(await evaluate(`document.querySelector('#ingredient-settings .ingredient-settings-header p')`), null, 'Ingredient header has the same compact structure as the supplier header');
    assert.ok(await evaluate(`document.querySelector('#ingredient-settings .js-close-ingredient').getBoundingClientRect().height >= 44`), 'Ingredient close control has a full-size target');
    writeFileSync(join(artifacts, 'ingredient-form.png'), Buffer.from((await call('Page.captureScreenshot')).data, 'base64'));
    assert.equal(await evaluate(`document.querySelector('#ingredient-reorder')`), null, 'Ingredient form has no reorder level field');
    const ingredientDialog = await evaluate(`(() => { const rect = document.querySelector('#ingredient-settings').getBoundingClientRect(); return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }; })()`);
    assert.ok(Math.abs(ingredientDialog.x - 720) <= 2 && Math.abs(ingredientDialog.y - 500) <= 2, 'Ingredient form is centered');
    await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 700, deviceScaleFactor: 1, mobile: false });
    const mobileIngredientDialog = await evaluate(`(() => { const rect = document.querySelector('#ingredient-settings').getBoundingClientRect(); return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, centerX: rect.left + rect.width / 2 }; })()`);
    assert.ok(mobileIngredientDialog.left >= 0 && mobileIngredientDialog.right <= 390 && mobileIngredientDialog.top >= 0 && mobileIngredientDialog.bottom <= 700 && Math.abs(mobileIngredientDialog.centerX - 195) <= 2, 'Ingredient form fits and is centered on mobile');
    await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await evaluate(`document.querySelector('#ingredient-settings').close()`);
    for (const tab of ['dashboard', 'ingredients', 'suppliers', 'journal', 'ledger', 'trial-balance', 'income-statement', 'balance-sheet', 'profile', 'settings', 'audit-trail']) {
        await evaluate(`(() => { const item = document.querySelector('#nav-${tab}'); const group = item.closest('.nav-group'); if (group) group.querySelector('.nav-dropdown-toggle').click(); item.click(); })()`);
        assert.equal(await evaluate(`document.querySelector('#${tab}-view').classList.contains('hidden')`), false);
        assert.equal(await evaluate(`document.querySelector('#nav-${tab}').getAttribute('aria-current')`), 'page');
        if (tab === 'journal' || tab === 'ledger') {
            assert.equal(await evaluate(`document.querySelector('#page-title').textContent`), tab === 'journal' ? 'General Journal' : 'General Ledger');
            assert.equal(await evaluate(`document.querySelector('#${tab}-view > div > div:first-child h2')`), null, `${tab} has no repeated title in its toolbar`);
        }
        if (['trial-balance', 'income-statement', 'balance-sheet'].includes(tab)) {
            const reportHeader = await evaluate(`(() => { const card = document.querySelector('#${tab}-view .report-card').getBoundingClientRect(); const heading = document.querySelector('#${tab}-view .report-heading').getBoundingClientRect(); return { left: heading.left - card.left, right: card.right - heading.right, title: document.querySelector('#${tab}-view .report-heading h2').textContent }; })()`);
            assert.ok(Math.abs(reportHeader.left) <= 2 && Math.abs(reportHeader.right) <= 2, `${tab} color band reaches both sides of its card`);
            assert.equal(reportHeader.title, { 'trial-balance': 'Trial Balance', 'income-statement': 'Income Statement', 'balance-sheet': 'Balance Sheet' }[tab]);
            writeFileSync(join(artifacts, `${tab}-desktop.png`), Buffer.from((await call('Page.captureScreenshot')).data, 'base64'));
        }
        if (tab === 'profile') {
            assert.equal(await evaluate(`document.querySelector('#profile-view .account-identity-copy h2').textContent`), 'Test User');
            assert.equal(await evaluate(`document.querySelector('#profile-view .account-panels').children.length`), 2);
            assert.equal(await evaluate(`document.querySelector('#header-status').classList.contains('hidden')`), true);
            writeFileSync(join(artifacts, 'profile-desktop.png'), Buffer.from((await call('Page.captureScreenshot')).data, 'base64'));
            await evaluate(`document.querySelector('#profile-view [data-tab="settings"]').click()`);
            assert.equal(await evaluate(`document.querySelector('#settings-view').classList.contains('hidden')`), false, 'Profile opens account settings');
        }
        if (tab === 'settings') {
            assert.equal(await evaluate(`document.querySelector('#settings-view .account-panels').children.length`), 2);
            assert.ok(await evaluate(`document.querySelector('#settings-view').textContent.includes('Profile changes and password updates are not available')`));
            writeFileSync(join(artifacts, 'settings-desktop.png'), Buffer.from((await call('Page.captureScreenshot')).data, 'base64'));
            await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 900, deviceScaleFactor: 1, mobile: false });
            assert.ok(await evaluate(`document.documentElement.scrollWidth <= innerWidth + 1`), 'Account settings fit on mobile');
            writeFileSync(join(artifacts, 'settings-mobile.png'), Buffer.from((await call('Page.captureScreenshot')).data, 'base64'));
            await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
            await evaluate(`document.querySelector('#settings-view [data-tab="profile"]').click()`);
            assert.equal(await evaluate(`document.querySelector('#profile-view').classList.contains('hidden')`), false, 'Settings opens profile');
        }
        if (tab === 'audit-trail') {
            assert.equal(await evaluate(`document.querySelector('#page-title').textContent`), 'Audit Trail');
            assert.equal(await evaluate(`document.querySelector('#audit-record-count').textContent`), `${await evaluate(`document.querySelectorAll('#audit-trail-body tr:not(:has(.empty-state))').length`)} records`);
            writeFileSync(join(artifacts, 'audit-desktop.png'), Buffer.from((await call('Page.captureScreenshot')).data, 'base64'));
        }
    }
    await evaluate(`document.querySelector('#nav-dashboard').click()`);
    assert.equal(await evaluate(`document.querySelector('.brand-link').getAttribute('href')`), '/dashboard');
    await evaluate(`document.querySelector('.brand-link').click()`);
    assert.equal(await evaluate(`document.querySelector('#dashboard-view').classList.contains('hidden')`), false, 'Brand opens Dashboard');
    assert.equal(await evaluate(`document.querySelectorAll('#new-entry-button').length`), 1, 'There is one Post Entry trigger');
    assert.ok(await evaluate(`!!document.querySelector('#journal-view #new-entry-button')`), 'Post Entry belongs to General Journal');
    await evaluate(`document.querySelector('[aria-controls="accounting-submenu"]').click(); document.querySelector('#nav-journal').click(); document.querySelector('#new-entry-button').click()`);
    assert.equal(await evaluate(`document.querySelector('#post-modal').open`), true, 'Journal Post Entry opens the transaction form');
    assert.ok(await evaluate(`document.querySelector('#post-modal .supplier-modal-card .supplier-form-section') !== null`), 'Journal form uses supplier card sections');
    writeFileSync(join(artifacts, 'journal-form.png'), Buffer.from((await call('Page.captureScreenshot')).data, 'base64'));
    await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 700, deviceScaleFactor: 1, mobile: false });
    assert.ok(await evaluate(`(() => { const box = document.querySelector('#post-modal').getBoundingClientRect(); return box.left >= 0 && box.right <= innerWidth && box.top >= 0 && box.bottom <= innerHeight; })()`), 'Journal form fits the mobile viewport');
    await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await evaluate(`document.querySelector('#post-modal .js-close-modal').click()`);
    await pause(50);
    assert.equal(await evaluate(`document.activeElement.id`), 'new-entry-button', 'Closing the form returns focus to Post Entry');
    await evaluate(`document.querySelector('#new-entry-button').click(); document.querySelector('#entry-date').value='2026-10-15'; document.querySelector('#entry-ref').value='${testJournalRef}'; document.querySelector('#entry-debit-account').value='101'; document.querySelector('#entry-credit-account').value='201'; document.querySelector('#entry-debit-amount').value='125'; document.querySelector('#entry-credit-amount').value='125'; document.querySelector('#entry-explanation').value='UI smoke journal entry'; document.querySelector('#entry-form').requestSubmit()`);
    let testJournalId;
    for (let i = 0; i < 50; i++) {
        testJournalId = await evaluate(`(async () => (await import('./js/state.js')).journalEntries.find(entry => entry.ref === '${testJournalRef}')?.id)()`);
        if (testJournalId) break;
        await pause(100);
    }
    assert.ok(testJournalId, 'Post Entry saves the journal entry');
    assert.ok(await evaluate(`!!document.querySelector('[data-entry-action="edit"][data-id="${testJournalId}"]') && !!document.querySelector('[data-entry-action="delete"][data-id="${testJournalId}"]')`), 'Posted entry has edit and delete buttons');
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('[data-entry-action="edit"][data-id="${testJournalId}"]').closest('td')).verticalAlign`), 'middle', 'Journal actions are centered vertically');
    await evaluate(`document.querySelector('[data-entry-action="edit"][data-id="${testJournalId}"]').click()`);
    assert.equal(await evaluate(`document.querySelector('#post-modal-title').textContent`), 'Edit journal entry');
    assert.equal(await evaluate(`document.querySelector('#entry-ref').value`), testJournalRef);
    await evaluate(`document.querySelector('#entry-debit-amount').value='225'; document.querySelector('#entry-credit-amount').value='225'; document.querySelector('#entry-explanation').value='Updated UI smoke journal entry'; document.querySelector('#entry-form').requestSubmit()`);
    for (let i = 0; i < 50; i++) {
        if (await evaluate(`(async () => (await import('./js/state.js')).journalEntries.find(entry => entry.id === ${testJournalId})?.debitAmount === 225)()`)) break;
        await pause(100);
    }
    assert.ok(await evaluate(`(async () => (await import('./js/state.js')).journalEntries.find(entry => entry.id === ${testJournalId})?.explanation === 'Updated UI smoke journal entry')()`), 'Edit updates the journal entry');
    await evaluate(`window.confirm = () => true; document.querySelector('[data-entry-action="delete"][data-id="${testJournalId}"]').click()`);
    for (let i = 0; i < 50; i++) {
        if (await evaluate(`(async () => !(await import('./js/state.js')).journalEntries.some(entry => entry.id === ${testJournalId}))()`)) break;
        await pause(100);
    }
    assert.ok(await evaluate(`(async () => !(await import('./js/state.js')).journalEntries.some(entry => entry.id === ${testJournalId}))()`), 'Delete removes the journal entry from the active journal');
    assert.ok(await evaluate(`document.querySelector('#journal-feedback').getAttribute('role') === 'alert' && !document.querySelector('#journal-feedback').classList.contains('hidden') && document.querySelector('#journal-feedback').textContent.includes('${testJournalRef}')`), 'Delete shows a journal alert');
    const voidStatus = spawnSync(mysql, ['-u', 'root', '--database=accounting_db', '-N', '-e', `SELECT status FROM journal_entries WHERE id = ${testJournalId};`], { encoding: 'utf8' });
    assert.equal(voidStatus.stdout.trim(), 'VOID', 'Delete keeps a voided database record');
    const journalResponse = await evaluate(`fetch('api/accounting.php').then(response => response.json())`);
    assert.ok(!journalResponse.journalEntries.some(entry => entry.id === testJournalId), 'Deleted journal entry is absent after reloading from the API');
    assert.ok(journalResponse.auditLogs.some(log => log.ref === testJournalRef && log.action === 'Edited Transaction'), 'Edit is audited');
    assert.ok(journalResponse.auditLogs.some(log => log.ref === testJournalRef && log.action === 'Deleted Transaction'), 'Delete is audited');
    await evaluate(`(async () => {
        const state = await import('./js/state.js');
        state.suppliers.splice(0, state.suppliers.length,
            { id: -9101, businessName: 'Harbor Catch Trading', category: 'Seafood', contactPerson: 'Mara Dizon', phone: '0917 555 0142', email: 'orders@harborcatch.test', address: 'Bauang, La Union', productsSupplied: 'Shrimp, squid, shellfish, and fresh fish', deliveryDays: 'Monday, Wednesday, Friday', leadTimeDays: 1, minimumOrder: 3500, isPreferred: true, status: 'Active', notes: '', updatedAt: '2026-10-08 09:00:00' },
            { id: -9102, businessName: 'North Fields Produce', category: 'Produce', contactPerson: 'Elena Ramos', phone: '0928 555 0197', email: '', address: 'San Fernando, La Union', productsSupplied: 'Vegetables, herbs, aromatics, and seasonal produce', deliveryDays: 'Tuesday and Saturday', leadTimeDays: 2, minimumOrder: 1500, isPreferred: false, status: 'Active', notes: '', updatedAt: '2026-10-07 14:30:00' },
            { id: -9103, businessName: 'Kusina Pantry Supply', category: 'Pantry', contactPerson: '', phone: '0995 555 0125', email: 'hello@kusinapantry.test', address: 'La Union', productsSupplied: 'Rice, oil, seasonings, beverages, and packaging', deliveryDays: 'Thursday', leadTimeDays: 3, minimumOrder: 0, isPreferred: false, status: 'Inactive', notes: '', updatedAt: '2026-10-06 11:20:00' }
        );
        (await import('./js/components/suppliers.js')).render();
    })()`);
    await evaluate(`document.querySelector('[aria-controls="inventory-submenu"]').click(); document.querySelector('#nav-suppliers').click()`);
    assert.ok(await evaluate(`getComputedStyle(document.querySelector('#header-root > header')).display !== 'none'`), 'Suppliers uses the shared header');
    assert.equal(await evaluate(`document.querySelector('#page-title').textContent`), 'Supplier directory');
    assert.equal(await evaluate(`document.querySelector('#header-root .header-eyebrow').textContent`), 'Procurement network');
    assert.ok(await evaluate(`!!document.querySelector('#header-root #add-supplier') && document.querySelector('#add-supplier').offsetParent !== null`), 'Add supplier is in the shared header');
    assert.equal(await evaluate(`document.querySelector('#add-ingredient').offsetParent`), null, 'Ingredient action is hidden on Suppliers');
    assert.equal(await evaluate(`document.querySelectorAll('#supplier-directory .supplier-directory-row').length`), 2, 'Active suppliers are listed by default');
    assert.equal(await evaluate(`document.querySelector('#supplier-active-count').textContent`), '2');
    assert.equal(await evaluate(`document.querySelector('#supplier-preferred-count').textContent`), '1');
    await evaluate(`document.querySelector('#supplier-search').value='harbor'; document.querySelector('#supplier-search').dispatchEvent(new Event('input', { bubbles: true }))`);
    assert.equal(await evaluate(`document.querySelectorAll('#supplier-directory .supplier-directory-row').length`), 1, 'Supplier search filters the directory');
    await evaluate(`document.querySelector('#supplier-search').value=''; document.querySelector('#supplier-search').dispatchEvent(new Event('input', { bubbles: true }))`);
    await evaluate(`document.querySelector('#add-supplier').click()`);
    assert.ok(await evaluate(`document.querySelector('#supplier-modal').open`));
    assert.equal(await evaluate(`document.activeElement.id`), 'supplier-business-name');
    assert.ok(await evaluate(`Array.from(document.querySelectorAll('#supplier-form input:not([type="hidden"]), #supplier-form textarea')).every(input => input.labels.length)`));
    await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await pause(100);
    assert.equal(await evaluate(`document.querySelector('#supplier-modal').open`), false);
    assert.equal(await evaluate(`document.activeElement.id`), 'add-supplier');
    writeFileSync(join(artifacts, 'suppliers-desktop.png'), Buffer.from((await call('Page.captureScreenshot')).data, 'base64'));
    for (const width of [390, 320]) {
        await call('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
        await pause(100);
        const pageWidth = await evaluate(`document.documentElement.scrollWidth`);
        assert.ok(pageWidth <= width + 1, `Supplier page must not overflow at ${width}px (scroll width ${pageWidth}px)`);
        assert.ok(await evaluate(`document.querySelector('#add-supplier').offsetParent !== null`), `Supplier action remains visible at ${width}px`);
    }
    await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await evaluate(`document.querySelector('#nav-dashboard').click()`);
    await pause(350);
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('#dashboard-view .kpi-card')).borderRadius`), '9px');
    assert.ok(await evaluate(`document.querySelector('header').textContent.includes('All recorded entries')`));
    assert.ok(await evaluate(`document.querySelector('#dashboard-view').textContent.includes('Catering & Events')`));
    await evaluate(`document.querySelector('#add-catering-event').click()`);
    assert.ok(await evaluate(`document.querySelector('#catering-event-modal').open`));
    assert.equal(await evaluate(`document.activeElement.id`), 'event-name');
    assert.ok(await evaluate(`Array.from(document.querySelectorAll('#catering-event-form input:not([type="hidden"]), #catering-event-form select, #catering-event-form textarea')).every(input => input.labels.length)`));
    await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await pause(100);
    assert.equal(await evaluate(`document.querySelector('#catering-event-modal').open`), false);
    writeFileSync(join(artifacts, 'desktop.png'), Buffer.from((await call('Page.captureScreenshot')).data, 'base64'));
    console.log(`UI checks passed. Screenshots: ${artifacts}`);
} finally {
    socket?.close();
    browser.kill();
    spawnSync(mysql, ['-u', 'root', '--database=accounting_db', '-e', `DELETE FROM journal_lines WHERE journal_entry_id IN (SELECT id FROM journal_entries WHERE reference_number = '${testJournalRef}'); DELETE FROM journal_entries WHERE reference_number = '${testJournalRef}'; DELETE FROM audit_logs WHERE reference_number = '${testJournalRef}';`]);
    spawnSync(mysql, ['-u', 'root', '--database=accounting_db', '-e', `DELETE FROM users WHERE email = '${testEmail}';`]);
}
