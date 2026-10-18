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
                    <div class="supplier-form-field"><label for="entry-ref">Transaction reference code</label><input type="text" id="entry-ref" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" placeholder="e.g. 00105" title="Enter exactly 5 digits" required></div>
                    <div class="supplier-form-field supplier-form-wide"><label for="entry-title">Entry Particulars</label><input type="text" id="entry-title" maxlength="150" placeholder="e.g. Initial investment" required></div>
                </div>
            </div>
            <div class="supplier-form-section">
                <div><span class="supplier-form-index">02</span><h3>Debit lines</h3></div>
                <div><div id="entry-debit-lines" class="entry-lines"></div><button type="button" class="entry-add-line" data-add-line="Debit"><i class="fa-solid fa-plus" aria-hidden="true"></i> Add debit line</button></div>
            </div>
            <div class="supplier-form-section">
                <div><span class="supplier-form-index">03</span><h3>Credit lines</h3></div>
                <div><div id="entry-credit-lines" class="entry-lines"></div><button type="button" class="entry-add-line" data-add-line="Credit"><i class="fa-solid fa-plus" aria-hidden="true"></i> Add credit line</button></div>
            </div>
            <p id="entry-balance" class="entry-balance" aria-live="polite">Total debits: ₱ 0.00 · Total credits: ₱ 0.00</p>
            <div class="supplier-form-actions"><button type="button" class="js-close-modal supplier-secondary-button">Cancel</button><button type="submit" class="supplier-primary-button" id="entry-submit-button">Post entry</button></div>
        </form>
    </div>
</dialog>
