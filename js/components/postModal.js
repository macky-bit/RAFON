/* Create and edit balanced journal transactions. */
import { loadTemplate } from '../loader.js';
import { chartOfAccounts, postEntry, updateEntry } from '../state.js';

let lastTrigger = null;

export async function mount(parent) {
    parent.insertAdjacentHTML('beforeend', await loadTemplate('postModal'));
}

// Populate Select Dropdowns in Modal
export function populateOptions() {
    const drSelect = document.getElementById('entry-debit-account');
    const crSelect = document.getElementById('entry-credit-account');
    for (const [select, label] of [[drSelect, 'debit'], [crSelect, 'credit']]) {
        select.replaceChildren(new Option(`Select a ${label} account`, ''));
        chartOfAccounts.forEach(account => select.add(new Option(
            `${account.code} - ${account.title} (${account.category})`, account.code
        )));
    }
}

export function openModal(entry = null, trigger = null) {
    lastTrigger = trigger || document.activeElement;
    document.getElementById('entry-form').reset();
    document.getElementById('entry-error').classList.add('hidden');
    populateOptions();
    const today = new Date();
    document.getElementById('entry-id').value = entry?.id || '';
    document.getElementById('entry-date').value = entry?.date || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    document.getElementById('entry-ref').value = entry?.ref || '';
    document.getElementById('entry-debit-account').value = entry?.debitCode || '';
    document.getElementById('entry-debit-amount').value = entry?.debitAmount ?? '';
    document.getElementById('entry-credit-account').value = entry?.creditCode || '';
    document.getElementById('entry-credit-amount').value = entry?.creditAmount ?? '';
    document.getElementById('entry-explanation').value = entry?.explanation || '';
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

    const date = document.getElementById('entry-date').value;
    const ref = document.getElementById('entry-ref').value;
    const debitCode = document.getElementById('entry-debit-account').value;
    const debitAmount = parseFloat(document.getElementById('entry-debit-amount').value);
    const creditCode = document.getElementById('entry-credit-account').value;
    const creditAmount = parseFloat(document.getElementById('entry-credit-amount').value);
    const explanation = document.getElementById('entry-explanation').value;

    const errorMessage = document.getElementById('entry-error');
    errorMessage.classList.add('hidden');

    // Accounting Balance Validation Rule
    if (debitAmount !== creditAmount) {
        errorMessage.textContent = 'Debit and credit amounts must be equal.';
        errorMessage.classList.remove('hidden');
        return;
    }

    const entry = {
        date: date,
        ref: ref,
        debitCode,
        debitAmount: debitAmount,
        creditCode,
        creditAmount: creditAmount,
        explanation: explanation
    };
    const id = Number(document.getElementById('entry-id').value) || null;

    const submitButton = event.submitter;
    if (submitButton) submitButton.disabled = true;

    try {
        if (id) await updateEntry(id, entry);
        else await postEntry(entry);
        closeModal();
    } catch (error) {
        errorMessage.textContent = `Could not post the transaction: ${error.message}`;
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
    document.querySelectorAll('.js-close-modal').forEach(button => {
        button.addEventListener('click', closeModal);
    });
    document.getElementById('entry-form').addEventListener('submit', handlePostEntry);
    document.getElementById('post-modal').addEventListener('click', event => {
        if (event.target === event.currentTarget) closeModal();
    });
}
