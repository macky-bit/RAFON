import { loadTemplate } from '../loader.js';
import { addSupplierTransaction, saveSupplier, setSupplierStatus, suppliers } from '../state.js';
import { escapeHTML } from '../utils.js';

let lastSupplierTrigger = null;

export async function mount(parent) {
    parent.insertAdjacentHTML('beforeend', await loadTemplate('suppliers'));
}

function textOrFallback(value, fallback = 'Not provided') {
    return value ? escapeHTML(value) : `<span class="supplier-missing">${fallback}</span>`;
}

function categoryIcon(category) {
    const value = String(category).toLowerCase();
    if (value.includes('seafood') || value.includes('fish')) return 'fa-fish-fins';
    if (value.includes('produce') || value.includes('vegetable')) return 'fa-carrot';
    if (value.includes('meat') || value.includes('poultry')) return 'fa-drumstick-bite';
    if (value.includes('equipment')) return 'fa-kitchen-set';
    if (value.includes('packag')) return 'fa-box-open';
    return 'fa-boxes-stacked';
}

function transactionDate(value) {
    if (!value) return '';
    const date = new Date(String(value).replace(' ', 'T'));
    return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('en-PH', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date);
}

function recentTransaction(transaction) {
    if (!transaction) {
        return '<p class="supplier-transaction-empty">No transactions recorded yet.</p>';
    }
    return `<div class="supplier-transaction-id">${escapeHTML(transaction.transactionId)}</div>
        <strong>${escapeHTML(transaction.title)}</strong>
        <p>${escapeHTML(transaction.description)}</p>
        <div class="supplier-transaction-meta">
            <a href="${escapeHTML(transaction.receiptPath)}" target="_blank" rel="noopener"><i class="fa-solid fa-paperclip"></i> Receipt</a>
            <time datetime="${escapeHTML(transaction.timeAndDate)}">${escapeHTML(transactionDate(transaction.timeAndDate))}</time>
        </div>`;
}

function updateCategoryFilter() {
    const filter = document.getElementById('supplier-category-filter');
    if (!filter) return;
    const selected = filter.value;
    const categories = [...new Set(suppliers.map(supplier => supplier.category).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b));
    filter.innerHTML = '<option value="">All categories</option>' + categories
        .map(category => `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`)
        .join('');
    if (categories.includes(selected)) filter.value = selected;
}

function filteredSuppliers() {
    const query = document.getElementById('supplier-search')?.value.trim().toLowerCase() || '';
    const category = document.getElementById('supplier-category-filter')?.value || '';
    const status = document.getElementById('supplier-status-filter')?.value || '';
    const role = document.getElementById('supplier-role-filter')?.value || '';
    const sort = document.getElementById('supplier-sort')?.value || 'name';

    const matches = suppliers.filter(supplier => {
        const searchable = [supplier.businessName, supplier.contactPerson, supplier.productsSupplied, supplier.category]
            .join(' ').toLowerCase();
        return (!query || searchable.includes(query))
            && (!category || supplier.category === category)
            && (!status || supplier.status === status)
            && (!role || (supplier.isPreferred ? 'Primary' : 'Backup') === role);
    });

    return matches.sort((a, b) => sort === 'recent'
        ? String(b.updatedAt).localeCompare(String(a.updatedAt))
        : a.businessName.localeCompare(b.businessName));
}

function supplierCard(supplier) {
    const isInactive = supplier.status === 'Inactive';
    return `<article class="supplier-directory-row ${isInactive ? 'supplier-is-inactive' : ''}" role="listitem">
        <div class="supplier-identity">
            <span class="supplier-directory-icon"><i class="fa-solid ${categoryIcon(supplier.category)}"></i></span>
            <div>
                <div class="supplier-label-line"><span class="supplier-category">${escapeHTML(supplier.category)}</span><span class="supplier-priority-badge ${supplier.isPreferred ? 'supplier-priority-primary' : 'supplier-priority-backup'}"><i class="fa-solid ${supplier.isPreferred ? 'fa-star' : 'fa-layer-group'}" aria-hidden="true"></i> ${supplier.isPreferred ? 'Primary' : 'Backup'}</span></div>
                <h3>${escapeHTML(supplier.businessName)}</h3>
                <p>${textOrFallback(supplier.productsSupplied, 'Products not provided')}</p>
            </div>
        </div>
        <div class="supplier-detail-group">
            <span class="supplier-column-label">Contact</span>
            <p><i class="fa-solid fa-user"></i>${textOrFallback(supplier.contactPerson)}</p>
            <p><i class="fa-solid fa-phone"></i>${textOrFallback(supplier.phone)}</p>
            <p><i class="fa-solid fa-envelope"></i>${textOrFallback(supplier.email)}</p>
            <p><i class="fa-solid fa-location-dot"></i>${textOrFallback(supplier.address)}</p>
        </div>
        <div class="supplier-detail-group supplier-recent-transaction">
            <span class="supplier-column-label">Recent transaction</span>
            ${recentTransaction(supplier.latestTransaction)}
        </div>
        <div class="supplier-row-end">
            <span class="supplier-status supplier-status-${supplier.status.toLowerCase()}">${escapeHTML(supplier.status)}</span>
            <div class="supplier-row-actions">
                <button type="button" data-supplier-action="transaction" data-id="${supplier.id}" aria-label="Add transaction for ${escapeHTML(supplier.businessName)}"><i class="fa-solid fa-receipt"></i><span>Transaction</span></button>
                <button type="button" data-supplier-action="edit" data-id="${supplier.id}" aria-label="Edit ${escapeHTML(supplier.businessName)}"><i class="fa-solid fa-pen"></i><span>Edit</span></button>
                <button type="button" data-supplier-action="status" data-id="${supplier.id}" aria-label="${isInactive ? 'Reactivate' : 'Archive'} ${escapeHTML(supplier.businessName)}"><i class="fa-solid ${isInactive ? 'fa-rotate-left' : 'fa-box-archive'}"></i><span>${isInactive ? 'Reactivate' : 'Archive'}</span></button>
            </div>
        </div>
    </article>`;
}

export function render() {
    const directory = document.getElementById('supplier-directory');
    if (!directory) return;
    updateCategoryFilter();

    const active = suppliers.filter(supplier => supplier.status === 'Active');
    const primary = active.filter(supplier => supplier.isPreferred);
    const backup = active.filter(supplier => !supplier.isPreferred);
    const categories = new Set(active.map(supplier => supplier.category));
    document.getElementById('supplier-active-count').textContent = String(active.length);
    document.getElementById('supplier-primary-count').textContent = String(primary.length);
    document.getElementById('supplier-backup-count').textContent = String(backup.length);
    document.getElementById('supplier-category-count').textContent = String(categories.size);

    const visible = filteredSuppliers();
    document.getElementById('supplier-results-summary').textContent = `${visible.length} supplier${visible.length === 1 ? '' : 's'}`;
    if (!visible.length) {
        directory.innerHTML = `<div class="supplier-empty-state"><span><i class="fa-solid fa-truck-field"></i></span><div><strong>${suppliers.length ? 'No suppliers match these filters.' : 'No suppliers have been added yet.'}</strong><p>${suppliers.length ? 'Try changing the search, category, status, or role.' : 'Add the first supplier to start your operational directory.'}</p></div></div>`;
        return;
    }
    directory.innerHTML = visible.map(supplierCard).join('');
}

function todayStatus(supplier) {
    return supplier?.status || 'Active';
}

function openSupplierModal(supplier = null, trigger = null) {
    lastSupplierTrigger = trigger || document.activeElement;
    document.getElementById('supplier-form').reset();
    document.getElementById('supplier-form-error').classList.add('hidden');
    document.getElementById('supplier-id').value = supplier?.id || '';
    document.getElementById('supplier-record-status').value = todayStatus(supplier);
    document.getElementById('supplier-business-name').value = supplier?.businessName || '';
    document.getElementById('supplier-category').value = supplier?.category || '';
    document.getElementById('supplier-contact-person').value = supplier?.contactPerson || '';
    document.getElementById('supplier-phone').value = supplier?.phone || '';
    document.getElementById('supplier-email').value = supplier?.email || '';
    document.getElementById('supplier-address').value = supplier?.address || '';
    document.getElementById('supplier-products').value = supplier?.productsSupplied || '';
    document.getElementById('supplier-delivery-days').value = supplier?.deliveryDays || '';
    document.getElementById('supplier-lead-time').value = supplier?.leadTimeDays ?? '';
    document.getElementById('supplier-minimum-order').value = supplier?.minimumOrder ?? 0;
    document.getElementById('supplier-role').value = supplier?.isPreferred ? 'Primary' : 'Backup';
    document.getElementById('supplier-notes').value = supplier?.notes || '';
    document.getElementById('supplier-modal-title').textContent = supplier ? 'Edit supplier' : 'Add supplier';
    document.getElementById('supplier-modal').showModal();
    document.getElementById('supplier-business-name').focus();
}

function closeSupplierModal() {
    document.getElementById('supplier-modal').close();
}

function openTransactionModal(supplier, trigger) {
    lastSupplierTrigger = trigger || document.activeElement;
    document.getElementById('supplier-transaction-form').reset();
    document.getElementById('supplier-transaction-form-error').classList.add('hidden');
    document.getElementById('supplier-transaction-supplier-id').value = supplier.id;
    document.getElementById('supplier-transaction-modal-title').textContent = `Add transaction · ${supplier.businessName}`;
    document.getElementById('supplier-transaction-modal').showModal();
    document.getElementById('supplier-transaction-id').focus();
}

function closeTransactionModal() {
    document.getElementById('supplier-transaction-modal').close();
}

async function handleSupplierSubmit(submitEvent) {
    submitEvent.preventDefault();
    const error = document.getElementById('supplier-form-error');
    error.classList.add('hidden');
    const id = Number(document.getElementById('supplier-id').value) || null;
    const supplier = {
        businessName: document.getElementById('supplier-business-name').value,
        category: document.getElementById('supplier-category').value,
        contactPerson: document.getElementById('supplier-contact-person').value,
        phone: document.getElementById('supplier-phone').value,
        email: document.getElementById('supplier-email').value,
        address: document.getElementById('supplier-address').value,
        productsSupplied: document.getElementById('supplier-products').value,
        deliveryDays: document.getElementById('supplier-delivery-days').value,
        leadTimeDays: document.getElementById('supplier-lead-time').value,
        minimumOrder: Number(document.getElementById('supplier-minimum-order').value),
        isPreferred: document.getElementById('supplier-role').value === 'Primary',
        status: document.getElementById('supplier-record-status').value,
        notes: document.getElementById('supplier-notes').value
    };
    const button = submitEvent.submitter;
    if (button) button.disabled = true;
    try {
        await saveSupplier(supplier, id);
        closeSupplierModal();
    } catch (requestError) {
        error.textContent = `Could not save the supplier: ${requestError.message}`;
        error.classList.remove('hidden');
    } finally {
        if (button) button.disabled = false;
    }
}

async function handleDirectoryClick(clickEvent) {
    const button = clickEvent.target.closest('[data-supplier-action]');
    if (!button) return;
    const supplier = suppliers.find(item => item.id === Number(button.dataset.id));
    if (!supplier) return;
    if (button.dataset.supplierAction === 'transaction') {
        openTransactionModal(supplier, button);
        return;
    }
    if (button.dataset.supplierAction === 'edit') {
        openSupplierModal(supplier, button);
        return;
    }

    const nextStatus = supplier.status === 'Active' ? 'Inactive' : 'Active';
    if (nextStatus === 'Inactive' && !window.confirm(`Archive "${supplier.businessName}"? Its record will remain available under Inactive suppliers.`)) return;
    button.disabled = true;
    try {
        await setSupplierStatus(supplier.id, nextStatus);
    } catch (error) {
        window.alert(`Could not update the supplier: ${error.message}`);
        button.disabled = false;
    }
}

async function handleTransactionSubmit(submitEvent) {
    submitEvent.preventDefault();
    const error = document.getElementById('supplier-transaction-form-error');
    const button = submitEvent.submitter;
    error.classList.add('hidden');
    if (button) button.disabled = true;
    try {
        await addSupplierTransaction(
            Number(document.getElementById('supplier-transaction-supplier-id').value),
            {
                transactionId: document.getElementById('supplier-transaction-id').value.trim(),
                title: document.getElementById('supplier-transaction-title').value.trim(),
                description: document.getElementById('supplier-transaction-description').value.trim()
            },
            document.getElementById('supplier-transaction-receipt').files[0]
        );
        closeTransactionModal();
    } catch (requestError) {
        error.textContent = `Could not save the transaction: ${requestError.message}`;
        error.classList.remove('hidden');
    } finally {
        if (button) button.disabled = false;
    }
}

export function bindEvents() {
    document.getElementById('add-supplier').addEventListener('click', event => openSupplierModal(null, event.currentTarget));
    document.querySelectorAll('.js-close-supplier-modal').forEach(button => button.addEventListener('click', closeSupplierModal));
    document.getElementById('supplier-form').addEventListener('submit', handleSupplierSubmit);
    document.getElementById('supplier-transaction-form').addEventListener('submit', handleTransactionSubmit);
    document.getElementById('supplier-directory').addEventListener('click', handleDirectoryClick);
    document.querySelectorAll('.js-close-supplier-transaction').forEach(button => button.addEventListener('click', closeTransactionModal));
    for (const id of ['supplier-search', 'supplier-category-filter', 'supplier-status-filter', 'supplier-role-filter', 'supplier-sort']) {
        document.getElementById(id).addEventListener(id === 'supplier-search' ? 'input' : 'change', render);
    }
    document.getElementById('supplier-modal').addEventListener('click', event => {
        if (event.target === event.currentTarget) closeSupplierModal();
    });
    document.getElementById('supplier-modal').addEventListener('close', () => {
        document.getElementById('supplier-form-error').classList.add('hidden');
        if (lastSupplierTrigger?.isConnected) lastSupplierTrigger.focus();
    });
    document.getElementById('supplier-transaction-modal').addEventListener('click', event => {
        if (event.target === event.currentTarget) closeTransactionModal();
    });
    document.getElementById('supplier-transaction-modal').addEventListener('close', () => {
        document.getElementById('supplier-transaction-form-error').classList.add('hidden');
        if (lastSupplierTrigger?.isConnected) lastSupplierTrigger.focus();
    });
}
