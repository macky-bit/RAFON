/* Collapsible sidebar navigation */
import { loadTemplate } from '../loader.js';

export async function mount(parent) {
    parent.insertAdjacentHTML('beforeend', await loadTemplate('sidebar'));
}

// Toggle Sidebar Expanded / Collapsed States
export function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const isOpen = sidebar.classList.toggle('nav-open');
    document.getElementById('sidebar-toggle').setAttribute('aria-expanded', String(isOpen));
}
export function bindEvents() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebar-toggle');
    toggle.setAttribute('aria-expanded', 'false');
    sidebar.querySelectorAll('[data-tab]').forEach(button => {
        const label = button.querySelector('.nav-text')?.textContent || button.getAttribute('aria-label');
        button.setAttribute('aria-label', label);
        button.title = label;
        button.addEventListener('click', () => {
            if (window.matchMedia('(max-width: 820px)').matches) {
                sidebar.classList.remove('nav-open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
    document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
    document.getElementById('sidebar-close').addEventListener('click', () => {
        sidebar.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
    });
    document.getElementById('logout-button').addEventListener('click', async () => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';
        const response = await fetch('api/auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'logout', csrfToken })
        });
        if (response.ok) window.location.assign('index.php');
    });
}
