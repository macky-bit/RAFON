/* Collapsible sidebar navigation */
import { loadTemplate } from '../loader.js';
import { switchTab } from '../router.js';

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
    const dropdowns = [...sidebar.querySelectorAll('.nav-dropdown-toggle')];
    const hideTimers = new WeakMap();
    const setDropdownOpen = (button, isOpen, animate = true) => {
        const submenu = button.nextElementSibling;
        clearTimeout(hideTimers.get(submenu));
        if (isOpen) {
            submenu.classList.remove('hidden');
            submenu.removeAttribute('inert');
            if (animate) submenu.getBoundingClientRect();
        } else {
            submenu.setAttribute('inert', '');
        }
        button.setAttribute('aria-expanded', String(isOpen));
        if (!isOpen) {
            const hide = () => {
                if (button.getAttribute('aria-expanded') === 'false') submenu.classList.add('hidden');
            };
            if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !submenu.classList.contains('hidden')) {
                hideTimers.set(submenu, setTimeout(hide, 250));
            } else {
                hide();
            }
        }
    };
    toggle.setAttribute('aria-expanded', 'false');
    sidebar.querySelector('.brand-link').addEventListener('click', event => {
        event.preventDefault();
        history.replaceState(null, '', '#dashboard');
        switchTab('dashboard');
        dropdowns.forEach(button => setDropdownOpen(button, false));
        sidebar.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
    });
    dropdowns.forEach(button => {
        const submenu = button.nextElementSibling;
        const hasActiveItem = Boolean(submenu.querySelector('.nav-active'));
        setDropdownOpen(button, hasActiveItem && !button.classList.contains('user-initials'), false);
        button.addEventListener('click', () => {
            const isOpen = button.getAttribute('aria-expanded') !== 'true';
            dropdowns.forEach(other => setDropdownOpen(other, other === button && isOpen));
        });
        submenu.querySelectorAll('button').forEach(item => {
            item.addEventListener('click', () => setDropdownOpen(button, false));
        });
    });
    sidebar.querySelectorAll('[data-tab]').forEach(button => {
        const label = button.querySelector('.nav-text')?.textContent || button.getAttribute('aria-label');
        button.setAttribute('aria-label', label);
        button.title = label;
        button.addEventListener('click', () => {
            if (button.closest('.top-nav-links') && !button.closest('.nav-submenu')) {
                dropdowns.forEach(dropdown => setDropdownOpen(dropdown, false));
            }
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
