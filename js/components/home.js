const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

async function authRequest(action, data) {
    const response = await fetch('api/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, csrfToken, ...data })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Authentication request failed.');
    return payload;
}

function setAuthMode(mode) {
    const isLogin = mode === 'login';
    document.getElementById('login-form').classList.toggle('hidden', !isLogin);
    document.getElementById('register-form').classList.toggle('hidden', isLogin);
    document.getElementById('auth-login-tab').setAttribute('aria-selected', String(isLogin));
    document.getElementById('auth-register-tab').setAttribute('aria-selected', String(!isLogin));
    document.getElementById('auth-login-tab').tabIndex = isLogin ? 0 : -1;
    document.getElementById('auth-register-tab').tabIndex = isLogin ? -1 : 0;
    document.getElementById('auth-title').textContent = isLogin ? 'Welcome back' : 'Create your account';
    document.getElementById('auth-subtitle').textContent = isLogin
        ? 'Sign in to manage your restaurant operations.'
        : 'Set up secure access for a restaurant team member.';
    document.getElementById('auth-message').classList.add('hidden');
}

function showMessage(message, isError = false) {
    const status = document.getElementById('auth-message');
    status.textContent = message;
    status.classList.toggle('auth-message-error', isError);
    status.classList.remove('hidden');
}

export function bindEvents() {
    document.querySelectorAll('[data-auth-mode]').forEach(button => {
        button.addEventListener('click', () => setAuthMode(button.dataset.authMode));
    });

    document.querySelector('.auth-tabs').addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        const mode = document.getElementById('auth-login-tab').getAttribute('aria-selected') === 'true'
            ? 'register'
            : 'login';
        setAuthMode(mode);
        document.getElementById(`auth-${mode}-tab`).focus();
    });

    document.querySelectorAll('[data-password-toggle]').forEach(button => {
        button.addEventListener('click', () => {
            const input = document.getElementById(button.dataset.passwordToggle);
            const reveal = input.type === 'password';
            input.type = reveal ? 'text' : 'password';
            button.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
            button.querySelector('i').className = reveal ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
        });
    });

    document.getElementById('login-form').addEventListener('submit', async event => {
        event.preventDefault();
        const button = event.submitter;
        if (button) button.disabled = true;
        try {
            const data = new FormData(event.currentTarget);
            await authRequest('login', {
                email: data.get('email'),
                password: data.get('password'),
                remember: data.has('remember')
            });
            window.location.assign('index.php#dashboard');
        } catch (error) {
            showMessage(error.message, true);
            if (button) button.disabled = false;
        }
    });

    document.getElementById('register-form').addEventListener('submit', async event => {
        event.preventDefault();
        const form = event.currentTarget;
        const password = document.getElementById('register-password');
        const confirmation = document.getElementById('register-password-confirmation');
        if (password.value !== confirmation.value) {
            confirmation.setCustomValidity('Passwords must match.');
            confirmation.reportValidity();
            showMessage('The passwords do not match.', true);
            return;
        }
        confirmation.setCustomValidity('');
        const button = event.submitter;
        if (button) button.disabled = true;
        try {
            const data = new FormData(form);
            const result = await authRequest('register', {
                full_name: data.get('full_name'),
                email: data.get('email'),
                password: data.get('password'),
                password_confirmation: data.get('password_confirmation'),
                terms: data.has('terms')
            });
            document.getElementById('login-email').value = data.get('email');
            form.reset();
            setAuthMode('login');
            showMessage(result.message);
        } catch (error) {
            showMessage(error.message, true);
        } finally {
            if (button) button.disabled = false;
        }
    });

    document.getElementById('register-password-confirmation').addEventListener('input', event => {
        event.currentTarget.setCustomValidity('');
    });

    document.querySelector('[data-auth-help]').addEventListener('click', () => {
        showMessage('Password recovery is not enabled yet. Contact an administrator.');
    });
}
