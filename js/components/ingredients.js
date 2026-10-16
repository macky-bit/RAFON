import { loadTemplate } from '../loader.js';
import { deleteIngredient, ingredients, saveIngredient, suppliers, uploadIngredientImage } from '../state.js';
import { escapeHTML, formatPHP } from '../utils.js';

let lastTrigger = null;

export async function mount(parent) {
    parent.insertAdjacentHTML('beforeend', await loadTemplate('ingredients'));
}

function stockStatus(item) {
    if (Number(item.stock) <= 0) return 'Out of stock';
    if (Number(item.stock) <= Number(item.reorderLevel)) return 'Low stock';
    return 'In stock';
}

function ingredientIcon(category) {
    const value = String(category).toLowerCase();
    if (value.includes('seafood')) return 'fa-shrimp';
    if (value.includes('produce')) return 'fa-carrot';
    if (value.includes('meat')) return 'fa-drumstick-bite';
    if (value.includes('grain')) return 'fa-bowl-rice';
    if (value.includes('dairy')) return 'fa-cheese';
    return 'fa-bottle-droplet';
}

function visibleIngredients() {
    const query = document.getElementById('ingredient-search')?.value.trim().toLowerCase() || '';
    const category = document.getElementById('ingredient-category-filter')?.value || '';
    const status = document.getElementById('ingredient-stock-filter')?.value || '';
    return ingredients.filter(item => {
        const matchesText = !query || `${item.name} ${item.supplierName || ''}`.toLowerCase().includes(query);
        return matchesText && (!category || item.category === category) && (!status || stockStatus(item) === status);
    });
}

function updateSupplierOptions(selectedId = '') {
    const select = document.getElementById('ingredient-supplier');
    if (!select) return;
    select.innerHTML = '<option value="">No supplier</option>' + suppliers
        .filter(supplier => supplier.status === 'Active')
        .map(supplier => `<option value="${supplier.id}">${escapeHTML(supplier.businessName)}</option>`)
        .join('');
    select.value = selectedId ? String(selectedId) : '';
}

function updateCategoryFilter() {
    const filter = document.getElementById('ingredient-category-filter');
    if (!filter) return;
    const selected = filter.value;
    const categories = [...new Set(ingredients.map(item => item.category))].sort((a, b) => a.localeCompare(b));
    filter.innerHTML = '<option value="">All categories</option>' + categories.map(category => `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`).join('');
    if (categories.includes(selected)) filter.value = selected;
}

function rowTemplate(item) {
    const status = stockStatus(item);
    const statusClass = status.toLowerCase().replaceAll(' ', '-');
    const visual = item.imagePath
        ? `<img src="${escapeHTML(item.imagePath)}" alt="">`
        : `<i class="fa-solid ${ingredientIcon(item.category)}" aria-hidden="true"></i>`;
    return `<tr>
        <td><span class="ingredient-identity"><span class="ingredient-icon">${visual}</span><strong>${escapeHTML(item.name)}</strong></span></td>
        <td>${escapeHTML(item.category)}</td>
        <td>${escapeHTML(item.supplierName || 'No supplier')}</td>
        <td class="mono">${escapeHTML(String(item.stock))} ${escapeHTML(item.unit)}</td>
        <td class="mono">${escapeHTML(formatPHP(item.cost))}</td>
        <td><span class="ingredient-status ingredient-status-${statusClass}"><i aria-hidden="true"></i>${status}</span></td>
        <td><div class="journal-row-actions"><button type="button" data-ingredient-id="${item.id}" data-action="edit" aria-label="Edit ${escapeHTML(item.name)}" title="Edit"><i class="fa-solid fa-pen" aria-hidden="true"></i></button><button type="button" data-ingredient-id="${item.id}" data-action="delete" aria-label="Delete ${escapeHTML(item.name)}" title="Delete"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button></div></td>
    </tr>`;
}

function showImagePreview(source = '') {
    const preview = document.getElementById('ingredient-image-preview');
    preview.innerHTML = source ? `<img src="${escapeHTML(source)}" alt="Ingredient preview">` : '<i class="fa-solid fa-image" aria-hidden="true"></i>';
}

export function render() {
    const body = document.getElementById('ingredients-table-body');
    if (!body) return;
    updateCategoryFilter();
    const visible = visibleIngredients();
    body.innerHTML = visible.length
        ? visible.map(rowTemplate).join('')
        : `<tr><td colspan="7" class="ingredients-empty"><i class="fa-solid ${ingredients.length ? 'fa-magnifying-glass' : 'fa-box-open'}" aria-hidden="true"></i><strong>${ingredients.length ? 'No ingredients found' : 'No ingredients yet'}</strong><span>${ingredients.length ? 'Try changing the search or filters.' : 'Add your first ingredient to begin tracking stock.'}</span></td></tr>`;
    document.getElementById('ingredients-count').textContent = `Showing ${visible.length} of ${ingredients.length} ingredient${ingredients.length === 1 ? '' : 's'}`;
}

function openSettings(item = null, trigger = null) {
    lastTrigger = trigger || document.activeElement;
    document.getElementById('ingredient-form').reset();
    document.getElementById('ingredient-form-error').classList.add('hidden');
    document.getElementById('ingredient-id').value = item?.id || '';
    document.getElementById('ingredient-current-image').value = item?.imagePath || '';
    showImagePreview(item?.imagePath || '');
    document.getElementById('ingredient-name').value = item?.name || '';
    document.getElementById('ingredient-category').value = item?.category || '';
    updateSupplierOptions(item?.supplierId || '');
    document.getElementById('ingredient-stock').value = item?.stock ?? 0;
    document.getElementById('ingredient-unit').value = item?.unit || 'kg';
    document.getElementById('ingredient-cost').value = item?.cost ?? 0;
    document.getElementById('ingredient-settings-title').textContent = item ? 'Ingredient settings' : 'Add ingredient';
    document.getElementById('ingredient-settings').showModal();
    document.getElementById('ingredient-name').focus();
}

function closeSettings() {
    document.getElementById('ingredient-settings').close();
    lastTrigger?.focus();
}

async function handleSubmit(event) {
    event.preventDefault();
    const error = document.getElementById('ingredient-form-error');
    const button = event.submitter;
    const id = Number(document.getElementById('ingredient-id').value) || null;
    const item = {
        name: document.getElementById('ingredient-name').value.trim(),
        category: document.getElementById('ingredient-category').value.trim(),
        supplierId: Number(document.getElementById('ingredient-supplier').value) || null,
        stock: Number(document.getElementById('ingredient-stock').value),
        unit: document.getElementById('ingredient-unit').value,
        cost: Number(document.getElementById('ingredient-cost').value),
        reorderLevel: Number(ingredients.find(ingredient => ingredient.id === id)?.reorderLevel ?? 0)
    };
    error.classList.add('hidden');
    if (button) button.disabled = true;
    try {
        const saved = await saveIngredient(item, id);
        const image = document.getElementById('ingredient-image').files[0];
        if (image) await uploadIngredientImage(saved.id, image);
        closeSettings();
    } catch (requestError) {
        error.textContent = `Could not save the ingredient: ${requestError.message}`;
        error.classList.remove('hidden');
    } finally {
        if (button) button.disabled = false;
    }
}

export function bindEvents() {
    document.getElementById('add-ingredient')?.addEventListener('click', event => openSettings(null, event.currentTarget));
    document.getElementById('ingredient-form')?.addEventListener('submit', handleSubmit);
    document.getElementById('ingredient-image')?.addEventListener('change', event => {
        const file = event.currentTarget.files[0];
        showImagePreview(file ? URL.createObjectURL(file) : document.getElementById('ingredient-current-image').value);
    });
    document.querySelectorAll('.js-close-ingredient').forEach(button => button.addEventListener('click', closeSettings));
    document.getElementById('ingredient-settings')?.addEventListener('click', event => {
        if (event.target === event.currentTarget) closeSettings();
    });
    ['ingredient-search', 'ingredient-category-filter', 'ingredient-stock-filter'].forEach(id => {
        document.getElementById(id)?.addEventListener(id === 'ingredient-search' ? 'input' : 'change', render);
    });
    document.getElementById('ingredients-table-body')?.addEventListener('click', async event => {
        const button = event.target.closest('[data-ingredient-id]');
        if (!button) return;
        const item = ingredients.find(entry => Number(entry.id) === Number(button.dataset.ingredientId));
        if (!item) return;
        if (button.dataset.action === 'edit') {
            openSettings(item, button);
            return;
        }
        if (button.dataset.action === 'delete' && window.confirm(`Delete ingredient "${item.name}"?`)) {
            button.disabled = true;
            try {
                await deleteIngredient(Number(item.id));
            } catch (error) {
                button.disabled = false;
                window.alert(`Could not delete the ingredient: ${error.message}`);
            }
        }
    });
}
