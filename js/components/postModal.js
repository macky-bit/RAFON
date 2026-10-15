/* "New Double-Entry Transaction" modal */
import { loadTemplate } from '../loader.js';
import { chartOfAccounts, postEntry } from '../state.js';

export async function mount(parent) {
    parent.insertAdjacentHTML('beforeend', await loadTemplate('postModal'));
}

// Populate Select Dropdowns in Modal
export function populateOptions() {
    const drSelect = document.getElementById('entry-debit-account');
    const crSelect = document.getElementById('entry-credit-account');

    drSelect.innerHTML = '<option value="">Select a debit account</option>';
    crSelect.innerHTML = '<option value="">Select a credit account</option>';

    chartOfAccounts.forEach(acc => {
        const opt = `<option value="${acc.title}">${acc.code} - ${acc.title} (${acc.category})</option>`;
        drSelect.innerHTML += opt;
        crSelect.innerHTML += opt;
    });
}

export function openModal() {
    populateOptions();
    const today = new Date();
    document.getElementById('entry-date').value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    document.getElementById('post-modal').showModal();
}

export function closeModal() {
    document.getElementById('post-modal').close();
}

async function handlePostEntry(event) {
    event.preventDefault();

    const date = document.getElementById('entry-date').value;
    const ref = document.getElementById('entry-ref').value;
    const debitAcc = document.getElementById('entry-debit-account').value;
    const debitAmount = parseFloat(document.getElementById('entry-debit-amount').value);
    const creditAcc = document.getElementById('entry-credit-account').value;
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

    const debitObj = chartOfAccounts.find(a => a.title === debitAcc);
    const creditObj = chartOfAccounts.find(a => a.title === creditAcc);

    // Build the new journal entry for the PHP API.
    const newEntry = {
        date: date,
        ref: ref,
        debitCode: debitObj ? debitObj.code : '---',
        debitAmount: debitAmount,
        creditCode: creditObj ? creditObj.code : '---',
        creditAmount: creditAmount,
        explanation: explanation
    };

    const submitButton = event.submitter;
    if (submitButton) submitButton.disabled = true;

    try {
        await postEntry(newEntry);
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
        document.getElementById('new-entry-button').focus();
    });
    document.querySelectorAll('.js-close-modal').forEach(button => {
        button.addEventListener('click', closeModal);
    });
    document.getElementById('entry-form').addEventListener('submit', handlePostEntry);
}
