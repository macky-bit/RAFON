/* Top app bar: sidebar toggle, page title, FY badge, Post Entry button */
import { loadTemplate } from '../loader.js';

export async function mount(parent) {
    parent.insertAdjacentHTML('beforeend', await loadTemplate('header'));
}

// openModal is passed in so the header never imports the modal directly
export function bindEvents({ onNewEntry }) {
    document.getElementById('new-entry-button').addEventListener('click', onNewEntry);
}
