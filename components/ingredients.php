<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/session.php';
startAppSession();
requireAuthenticatedUser();
?>
<section id="ingredients-view" class="hidden ingredients-shell">
    <div class="ingredients-card">
        <div class="ingredients-toolbar" aria-label="Ingredient filters">
            <label class="ingredient-search" for="ingredient-search"><span class="sr-only">Search ingredients</span><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><input type="search" id="ingredient-search" placeholder="Search ingredients or suppliers"></label>
            <label><span class="sr-only">Category</span><select id="ingredient-category-filter"><option value="">All categories</option></select></label>
            <label><span class="sr-only">Stock status</span><select id="ingredient-stock-filter"><option value="">All stock</option><option value="In stock">In stock</option><option value="Low stock">Low stock</option><option value="Out of stock">Out of stock</option></select></label>
        </div>

        <div class="ingredients-table-wrap">
            <table class="ingredients-table">
                <thead><tr><th>Ingredient</th><th>Category</th><th>Supplier</th><th>Stock</th><th>Cost / unit</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody id="ingredients-table-body"></tbody>
            </table>
        </div>
        <footer class="ingredients-footer"><p id="ingredients-count" aria-live="polite">0 ingredients</p><span>Stock status is based on the reorder level.</span></footer>
    </div>

    <dialog id="ingredient-settings" aria-labelledby="ingredient-settings-title">
        <form id="ingredient-form" class="ingredient-settings-card">
            <div class="supplier-modal-header ingredient-settings-header">
                <div><span class="eyebrow">Inventory record</span><h2 id="ingredient-settings-title">Add ingredient</h2></div>
                <button type="button" class="js-close-ingredient" aria-label="Close ingredient form"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
            </div>
            <input type="hidden" id="ingredient-id">
            <input type="hidden" id="ingredient-current-image">
            <p id="ingredient-form-error" class="form-error hidden" role="alert"></p>
            <div class="ingredient-image-picker">
                <span class="ingredient-image-preview" id="ingredient-image-preview"><i class="fa-solid fa-image" aria-hidden="true"></i></span>
                <div><strong>Ingredient image</strong><p>JPG, PNG, or WebP up to 5 MB.</p><label for="ingredient-image" class="ingredient-image-button"><i class="fa-solid fa-arrow-up-from-bracket" aria-hidden="true"></i> Choose image</label><input type="file" id="ingredient-image" accept="image/jpeg,image/png,image/webp"></div>
            </div>
            <div class="ingredient-fields">
                <label class="ingredient-field ingredient-field-wide"><span>Ingredient name</span><input id="ingredient-name" maxlength="120" required></label>
                <label class="ingredient-field"><span>Category</span><input id="ingredient-category" list="ingredient-categories" maxlength="80" required><datalist id="ingredient-categories"><option value="Seafood"><option value="Produce"><option value="Meat"><option value="Pantry"><option value="Grains"><option value="Dairy"></datalist></label>
                <label class="ingredient-field"><span>Supplier</span><select id="ingredient-supplier"><option value="">No supplier</option></select></label>
                <label class="ingredient-field"><span>Current stock</span><input type="number" id="ingredient-stock" min="0" step="0.01" required></label>
                <label class="ingredient-field"><span>Unit</span><select id="ingredient-unit"><option>kg</option><option>g</option><option>L</option><option>mL</option><option>pc</option><option>pack</option></select></label>
                <label class="ingredient-field"><span>Unit cost</span><span class="ingredient-money-input"><b>₱</b><input type="number" id="ingredient-cost" min="0" step="0.01" required></span></label>
            </div>
            <div class="ingredient-settings-actions"><button type="button" class="ingredient-secondary-button js-close-ingredient">Cancel</button><button type="submit" class="ingredient-primary-button">Save changes</button></div>
        </form>
    </dialog>
</section>
