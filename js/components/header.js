/* App header: navigation toggle, page title, and status badge */
import { loadTemplate } from '../loader.js';

export async function mount(parent) {
    parent.insertAdjacentHTML('beforeend', await loadTemplate('header'));
}
