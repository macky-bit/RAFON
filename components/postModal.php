<?php declare(strict_types=1); ?>
<dialog id="post-modal" aria-labelledby="post-modal-title">
    <div class="supplier-modal-card journal-modal-card">
        <div class="supplier-modal-header">
            <div><span class="eyebrow">Journal record</span><h2 id="post-modal-title">Post journal entry</h2></div>
            <button type="button" class="js-close-modal" aria-label="Close transaction form"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
        </div>
        <form id="entry-form">
            <input type="hidden" id="entry-id">
            <p id="entry-error" class="form-error hidden" role="alert"></p>
            <div class="supplier-form-section">
                <div><span class="supplier-form-index">01</span><h3>Transaction details</h3></div>
                <div class="supplier-form-grid">
                    <div class="supplier-form-field"><label for="entry-date">Transaction date</label><input type="date" id="entry-date" required></div>
                    <div class="supplier-form-field"><label for="entry-ref">PR reference code</label><input type="text" id="entry-ref" maxlength="50" placeholder="e.g. GJ-105" required></div>
                    <div class="supplier-form-field supplier-form-wide"><label for="entry-explanation">Transaction particulars / explanation</label><input type="text" id="entry-explanation" maxlength="500" placeholder="To record daily seafood purchases, sales, etc." required></div>
                </div>
            </div>
            <div class="supplier-form-section">
                <div><span class="supplier-form-index">02</span><h3>Debit line</h3></div>
                <div class="supplier-form-grid">
                    <div class="supplier-form-field"><label for="entry-debit-account">Debit account</label><select id="entry-debit-account" required></select></div>
                    <div class="supplier-form-field"><label for="entry-debit-amount">Debit amount (PHP)</label><input type="number" min="0.01" step="0.01" id="entry-debit-amount" placeholder="Amount (₱)" required></div>
                </div>
            </div>
            <div class="supplier-form-section">
                <div><span class="supplier-form-index">03</span><h3>Credit line</h3></div>
                <div class="supplier-form-grid">
                    <div class="supplier-form-field"><label for="entry-credit-account">Credit account</label><select id="entry-credit-account" required></select></div>
                    <div class="supplier-form-field"><label for="entry-credit-amount">Credit amount (PHP)</label><input type="number" min="0.01" step="0.01" id="entry-credit-amount" placeholder="Amount (₱)" required></div>
                </div>
            </div>
            <div class="supplier-form-actions"><button type="button" class="js-close-modal supplier-secondary-button">Cancel</button><button type="submit" class="supplier-primary-button" id="entry-submit-button">Post entry</button></div>
        </form>
    </div>
</dialog>
