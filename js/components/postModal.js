/* Create and edit balanced simple or compound journal entries. */
import { loadTemplate } from '../loader.js';
import { chartOfAccounts, postEntry, updateEntry } from '../state.js';

let lastTrigger = null;
let nextLineId = 0;

export async function mount(parent) {
    parent.insertAdjacentHTML('beforeend', await loadTemplate('postModal'));
}

function lineContainer(type) {
    return document.getElementById(type === 'Debit' ? 'entry-debit-lines' : 'entry-credit-lines');
}

function updateBalance() {
    const totals = { Debit: 0, Credit: 0 };
    for (const type of ['Debit', 'Credit']) {
        lineContainer(type).querySelectorAll('.entry-line-amount').forEach(input => {
            totals[type] += Math.round((Number(input.value) || 0) * 100);
        });
    }
    const money = cents => (cents / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const indicator = document.getElementById('entry-balance');
    indicator.textContent = `Total debits: ₱ ${money(totals.Debit)} · Total credits: ₱ ${money(totals.Credit)}`;
    indicator.classList.toggle('is-balanced', totals.Debit > 0 && totals.Debit === totals.Credit);
}

function updateRemoveButtons(type) {
    const buttons = lineContainer(type).querySelectorAll('.entry-remove-line');
    buttons.forEach(button => { button.disabled = buttons.length === 1; });
}

function addLine(type, line = null) {
    const id = ++nextLineId;
    const row = document.createElement('div');
    row.className = 'entry-line-row';
    row.innerHTML = `<div class="supplier-form-field"><label for="entry-account-${id}">${type} account</label><select id="entry-account-${id}" class="entry-line-account" required></select></div>
        <div class="supplier-form-field"><label for="entry-amount-${id}">Amount (PHP)</label><input id="entry-amount-${id}" class="entry-line-amount" type="number" min="1" step="1" placeholder="Amount (₱)" required></div>
        <button type="button" class="entry-remove-line" aria-label="Remove ${type.toLowerCase()} line" title="Remove line"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>`;
    const select = row.querySelector('select');
    select.add(new Option(`Select a ${type.toLowerCase()} account`, ''));
    chartOfAccounts.forEach(account => select.add(new Option(`${account.code} - ${account.title} (${account.category})`, account.code)));
    select.value = line?.accountCode || '';
    const amountInput = row.querySelector('input');
    amountInput.value = line?.amount ?? '';
    if (line && !Number.isInteger(Number(line.amount))) {
        amountInput.min = '0.01';
        amountInput.step = 'any';
    }
    lineContainer(type).appendChild(row);
    updateRemoveButtons(type);
    updateBalance();
    return row;
}

export function openModal(entry = null, trigger = null) {
    lastTrigger = trigger || document.activeElement;
    document.getElementById('entry-form').reset();
    document.getElementById('entry-error').classList.add('hidden');
    for (const type of ['Debit', 'Credit']) lineContainer(type).replaceChildren();
    const today = new Date();
    document.getElementById('entry-id').value = entry?.id || '';
    document.getElementById('entry-date').value = entry?.date || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const referenceInput = document.getElementById('entry-ref');
    const legacyReference = entry && !/^[0-9]{3}$/.test(entry.ref);
    referenceInput.dataset.legacyRef = legacyReference ? entry.ref : '';
    referenceInput.maxLength = legacyReference ? 50 : 3;
    if (legacyReference) referenceInput.removeAttribute('pattern');
    else referenceInput.pattern = '[0-9]{3}';
    referenceInput.value = entry?.ref || '';
    document.getElementById('entry-explanation').value = entry?.explanation || '';
    const lines = entry?.lines || (entry ? [
        { type: 'Debit', accountCode: entry.debitCode, amount: entry.debitAmount },
        { type: 'Credit', accountCode: entry.creditCode, amount: entry.creditAmount }
    ] : []);
    for (const type of ['Debit', 'Credit']) {
        const selected = lines.filter(line => line.type === type);
        (selected.length ? selected : [null]).forEach(line => addLine(type, line));
    }
    document.getElementById('post-modal-title').textContent = entry ? 'Edit journal entry' : 'Post journal entry';
    document.getElementById('entry-submit-button').textContent = entry ? 'Save changes' : 'Post entry';
    document.getElementById('post-modal').showModal();
    document.getElementById('entry-date').focus();
}

export function closeModal() {
    document.getElementById('post-modal').close();
}

async function handlePostEntry(event) {
    event.preventDefault();
    const errorMessage = document.getElementById('entry-error');
    errorMessage.classList.add('hidden');
    const referenceInput = document.getElementById('entry-ref');
    if (!/^[0-9]{3}$/.test(referenceInput.value.trim()) && referenceInput.value.trim() !== referenceInput.dataset.legacyRef) {
        errorMessage.textContent = 'PR reference code must be exactly 3 digits.';
        errorMessage.classList.remove('hidden');
        referenceInput.focus();
        return;
    }
    const lines = ['Debit', 'Credit'].flatMap(type => [...lineContainer(type).querySelectorAll('.entry-line-row')].map(row => ({
        type,
        accountCode: row.querySelector('.entry-line-account').value,
        amount: Number(row.querySelector('.entry-line-amount').value)
    })));
    const totals = { Debit: 0, Credit: 0 };
    for (const line of lines) totals[line.type] += Math.round(line.amount * 100);
    if (lines.length > 30 || totals.Debit <= 0 || totals.Debit !== totals.Credit) {
        errorMessage.textContent = lines.length > 30 ? 'A journal entry can have at most 30 lines.' : 'Total debit and credit amounts must be positive and equal.';
        errorMessage.classList.remove('hidden');
        return;
    }
    const entry = {
        date: document.getElementById('entry-date').value,
        ref: document.getElementById('entry-ref').value.trim(),
        explanation: document.getElementById('entry-explanation').value.trim(),
        lines
    };
    const id = Number(document.getElementById('entry-id').value) || null;
    const submitButton = event.submitter;
    if (submitButton) submitButton.disabled = true;
    try {
        if (id) await updateEntry(id, entry);
        else await postEntry(entry);
        closeModal();
    } catch (error) {
        errorMessage.textContent = `Could not save the transaction: ${error.message}`;
        errorMessage.classList.remove('hidden');
    } finally {
        if (submitButton) submitButton.disabled = false;
    }
}

export function bindEvents() {
    document.getElementById('post-modal').addEventListener('close', () => {
        document.getElementById('entry-form').reset();
        document.getElementById('entry-error').classList.add('hidden');
        (lastTrigger?.isConnected ? lastTrigger : document.getElementById('new-entry-button'))?.focus();
    });
    document.querySelectorAll('.js-close-modal').forEach(button => button.addEventListener('click', closeModal));
    document.getElementById('entry-form').addEventListener('submit', handlePostEntry);
    document.getElementById('entry-form').addEventListener('click', event => {
        const addButton = event.target.closest('[data-add-line]');
        if (addButton) {
            if (document.querySelectorAll('.entry-line-row').length >= 30) return;
            addLine(addButton.dataset.addLine).querySelector('select').focus();
            return;
        }
        const removeButton = event.target.closest('.entry-remove-line');
        if (removeButton && !removeButton.disabled) {
            const type = removeButton.closest('#entry-debit-lines') ? 'Debit' : 'Credit';
            removeButton.closest('.entry-line-row').remove();
            updateRemoveButtons(type);
            updateBalance();
        }
    });
    document.getElementById('entry-form').addEventListener('input', updateBalance);
    document.getElementById('post-modal').addEventListener('click', event => {
        if (event.target === event.currentTarget) closeModal();
    });
}
