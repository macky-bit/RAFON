async function accountRequest(action, data) {
    const response = await fetch('api/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action,
            csrfToken: document.querySelector('meta[name="csrf-token"]')?.content || '',
            ...data
        })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'The account update could not be completed.');
    return payload;
}

function showStatus(element, message, isError = false) {
    element.textContent = message;
    element.classList.toggle('is-error', isError);
    element.classList.remove('hidden');
    element.setAttribute('role', isError ? 'alert' : 'status');
    element.focus({ preventScroll: true });
}

function initialsFor(name) {
    return name.trim().split(/\s+/).slice(0, 2).map(part => Array.from(part)[0] || '').join('').toUpperCase();
}

export function bindEvents() {
    const profileForm = document.getElementById('profile-settings-form');
    const passwordForm = document.getElementById('password-settings-form');
    const confirmation = document.getElementById('settings-password-confirmation');
    const passwordInputs = passwordForm.querySelectorAll('input[name="current_password"], input[name="new_password"], input[name="password_confirmation"]');

    profileForm.addEventListener('submit', async event => {
        event.preventDefault();
        const button = event.submitter;
        const status = document.getElementById('profile-settings-status');
        if (button) button.disabled = true;
        status.classList.add('hidden');
        try {
            const fullName = document.getElementById('settings-full-name').value.trim();
            const result = await accountRequest('update-profile', { full_name: fullName });
            document.querySelectorAll('[data-account-name]').forEach(element => { element.textContent = result.user.fullName; });
            document.querySelectorAll('[data-account-initials]').forEach(element => { element.textContent = initialsFor(result.user.fullName); });
            const profileButton = document.querySelector('.user-initials');
            profileButton.textContent = initialsFor(result.user.fullName);
            profileButton.title = result.user.fullName;
            profileButton.setAttribute('aria-label', `Open profile menu for ${result.user.fullName}`);
            showStatus(status, result.message);
        } catch (error) {
            showStatus(status, error.message, true);
        } finally {
            if (button) button.disabled = false;
        }
    });

    passwordForm.addEventListener('submit', async event => {
        event.preventDefault();
        const newPassword = document.getElementById('settings-new-password');
        if (newPassword.value !== confirmation.value) {
            confirmation.setCustomValidity('New passwords must match.');
            confirmation.reportValidity();
            confirmation.focus();
            return;
        }
        confirmation.setCustomValidity('');
        const button = event.submitter;
        const status = document.getElementById('password-settings-status');
        if (button) button.disabled = true;
        status.classList.add('hidden');
        try {
            const data = new FormData(passwordForm);
            const result = await accountRequest('change-password', {
                current_password: data.get('current_password'),
                new_password: data.get('new_password'),
                password_confirmation: data.get('password_confirmation')
            });
            passwordForm.reset();
            passwordInputs.forEach(input => { input.type = 'password'; });
            if (result.csrfToken) document.querySelector('meta[name="csrf-token"]').content = result.csrfToken;
            showStatus(status, result.message);
        } catch (error) {
            showStatus(status, error.message, true);
        } finally {
            if (button) button.disabled = false;
        }
    });

    confirmation.addEventListener('input', () => confirmation.setCustomValidity(''));
    document.getElementById('settings-show-passwords').addEventListener('change', event => {
        passwordInputs.forEach(input => {
            input.type = event.currentTarget.checked ? 'text' : 'password';
        });
    });
}
