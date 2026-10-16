<?php declare(strict_types=1); ?>
<section id="suppliers-view" class="hidden supplier-shell">
    <div class="supplier-stats" aria-label="Supplier summary">
        <div><span>Active suppliers</span><strong id="supplier-active-count">0</strong></div>
        <div><span>Preferred suppliers</span><strong id="supplier-preferred-count">0</strong></div>
        <div><span>Categories</span><strong id="supplier-category-count">0</strong></div>
    </div>

    <div class="supplier-toolbar" aria-label="Supplier directory controls">
        <label class="supplier-search" for="supplier-search"><span class="sr-only">Search suppliers</span><i class="fa-solid fa-magnifying-glass"></i><input type="search" id="supplier-search" placeholder="Search supplier, contact, or product"></label>
        <label><span>Category</span><select id="supplier-category-filter"><option value="">All categories</option></select></label>
        <label><span>Status</span><select id="supplier-status-filter"><option value="Active">Active</option><option value="">All statuses</option><option value="Inactive">Inactive</option></select></label>
        <label><span>Sort by</span><select id="supplier-sort"><option value="name">Name A–Z</option><option value="recent">Recently updated</option></select></label>
    </div>

    <div class="supplier-results-heading"><p id="supplier-results-summary" aria-live="polite">0 suppliers</p><span>Contact details and latest transaction</span></div>
    <div id="supplier-directory" class="supplier-directory" role="list"></div>

    <dialog id="supplier-modal" aria-labelledby="supplier-modal-title">
        <div class="supplier-modal-card">
            <div class="supplier-modal-header">
                <div><span class="eyebrow">Supplier record</span><h2 id="supplier-modal-title">Add supplier</h2></div>
                <button type="button" class="js-close-supplier-modal" aria-label="Close supplier form"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form id="supplier-form">
                <input type="hidden" id="supplier-id">
                <input type="hidden" id="supplier-record-status" value="Active">
                <p id="supplier-form-error" class="form-error hidden" role="alert"></p>
                <div class="supplier-form-section">
                    <div><span class="supplier-form-index">01</span><h3>Business and contact</h3></div>
                    <div class="supplier-form-grid">
                        <div class="supplier-form-field supplier-form-wide"><label for="supplier-business-name">Business name</label><input id="supplier-business-name" maxlength="150" required></div>
                        <div class="supplier-form-field"><label for="supplier-category">Category</label><input id="supplier-category" maxlength="100" list="supplier-category-options" required><datalist id="supplier-category-options"><option value="Seafood"><option value="Produce"><option value="Meat & Poultry"><option value="Pantry"><option value="Equipment"><option value="Packaging"></datalist></div>
                        <div class="supplier-form-field"><label for="supplier-contact-person">Contact person</label><input id="supplier-contact-person" maxlength="150"></div>
                        <div class="supplier-form-field"><label for="supplier-phone">Phone number</label><input type="tel" id="supplier-phone" maxlength="50"></div>
                        <div class="supplier-form-field"><label for="supplier-email">Email address</label><input type="email" id="supplier-email" maxlength="190"></div>
                        <div class="supplier-form-field supplier-form-wide"><label for="supplier-address">Address</label><input id="supplier-address" maxlength="300"></div>
                        <div class="supplier-form-field supplier-form-wide"><label for="supplier-products">Products supplied</label><textarea id="supplier-products" maxlength="500" rows="2" placeholder="e.g. Shrimp, squid, shellfish, fresh fish"></textarea></div>
                    </div>
                </div>
                <div class="supplier-form-section">
                    <div><span class="supplier-form-index">02</span><h3>Operations</h3></div>
                    <div class="supplier-form-grid">
                        <div class="supplier-form-field"><label for="supplier-delivery-days">Delivery days</label><input id="supplier-delivery-days" maxlength="150" placeholder="e.g. Monday, Wednesday, Friday"></div>
                        <div class="supplier-form-field"><label for="supplier-lead-time">Lead time (days)</label><input type="number" id="supplier-lead-time" min="0" max="365" step="1"></div>
                        <div class="supplier-form-field"><label for="supplier-minimum-order">Minimum order (PHP)</label><input type="number" id="supplier-minimum-order" min="0" step="0.01" value="0"></div>
                        <label class="supplier-preferred-control"><input type="checkbox" id="supplier-preferred"><span><strong>Preferred supplier</strong><small>Highlight this supplier in the directory.</small></span></label>
                        <div class="supplier-form-field supplier-form-wide"><label for="supplier-notes">Notes</label><textarea id="supplier-notes" maxlength="1000" rows="3"></textarea></div>
                    </div>
                </div>
                <div class="supplier-form-actions"><button type="button" class="js-close-supplier-modal supplier-secondary-button">Cancel</button><button type="submit" class="supplier-primary-button">Save supplier</button></div>
            </form>
        </div>
    </dialog>

    <dialog id="supplier-transaction-modal" aria-labelledby="supplier-transaction-modal-title">
        <div class="supplier-modal-card">
            <div class="supplier-modal-header">
                <div><span class="eyebrow">Recent transaction</span><h2 id="supplier-transaction-modal-title">Add supplier transaction</h2></div>
                <button type="button" class="js-close-supplier-transaction" aria-label="Close transaction form"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form id="supplier-transaction-form">
                <input type="hidden" id="supplier-transaction-supplier-id">
                <p id="supplier-transaction-form-error" class="form-error hidden" role="alert"></p>
                <div class="supplier-form-grid">
                    <div class="supplier-form-field"><label for="supplier-transaction-id">Transaction ID</label><input id="supplier-transaction-id" maxlength="50" required></div>
                    <div class="supplier-form-field"><label for="supplier-transaction-title">Title</label><input id="supplier-transaction-title" maxlength="150" required></div>
                    <div class="supplier-form-field supplier-form-wide"><label for="supplier-transaction-description">Description</label><textarea id="supplier-transaction-description" maxlength="500" rows="3" required></textarea></div>
                    <div class="supplier-form-field supplier-form-wide"><label for="supplier-transaction-receipt">Receipt</label><input type="file" id="supplier-transaction-receipt" accept="application/pdf,image/jpeg,image/png,image/webp" required><small>PDF, JPG, PNG, or WebP · Up to 5 MB. Time and date are recorded automatically.</small></div>
                </div>
                <div class="supplier-form-actions"><button type="button" class="js-close-supplier-transaction supplier-secondary-button">Cancel</button><button type="submit" class="supplier-primary-button">Save transaction</button></div>
            </form>
        </div>
    </dialog>
</section>
