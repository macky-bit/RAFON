export function confirmAction({ title, message, action = 'Delete', trigger }) {
    let dialog = document.getElementById('action-confirm-dialog');
    if (!dialog) {
        dialog = document.createElement('dialog');
        dialog.id = 'action-confirm-dialog';
        dialog.setAttribute('role', 'alertdialog');
        dialog.setAttribute('aria-labelledby', 'action-confirm-title');
        dialog.setAttribute('aria-describedby', 'action-confirm-message');
        dialog.innerHTML = `<div class="action-confirm-card">
            <span class="action-confirm-icon" aria-hidden="true"><i class="fa-solid fa-triangle-exclamation"></i></span>
            <h2 id="action-confirm-title"></h2>
            <p id="action-confirm-message"></p>
            <div class="action-confirm-buttons">
                <button type="button" data-confirm-choice="cancel">Cancel</button>
                <button type="button" data-confirm-choice="confirm"></button>
            </div>
        </div>`;
        document.body.appendChild(dialog);
        dialog.addEventListener('click', event => {
            const choice = event.target.closest('[data-confirm-choice]');
            if (choice) dialog.close(choice.dataset.confirmChoice);
            else if (event.target === dialog) dialog.close('cancel');
        });
    }

    if (dialog.open) return Promise.resolve(false);
    dialog.querySelector('#action-confirm-title').textContent = title;
    dialog.querySelector('#action-confirm-message').textContent = message;
    dialog.querySelector('[data-confirm-choice="confirm"]').textContent = action;
    dialog.returnValue = 'cancel';

    return new Promise(resolve => {
        dialog.addEventListener('close', () => {
            resolve(dialog.returnValue === 'confirm');
            if (trigger?.isConnected) trigger.focus();
        }, { once: true });
        dialog.showModal();
        dialog.querySelector('[data-confirm-choice="cancel"]').focus();
    });
}
