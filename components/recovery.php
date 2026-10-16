<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/session.php';
startAppSession();
requireAuthenticatedUser();
?>
<section id="recovery-view" class="hidden recovery-view">
    <div class="recovery-card">
        <div class="recovery-heading">
            <div><h2>Recoverable records</h2><p>Restore deleted and voided records to their original lists.</p></div>
            <div class="recovery-heading-actions"><a href="api/recovery.php?action=download" id="recovery-download" class="recovery-refresh" download><i class="fa-solid fa-download" aria-hidden="true"></i> Download backup</a><button type="button" id="recovery-refresh" class="recovery-refresh"><i class="fa-solid fa-rotate" aria-hidden="true"></i> Refresh</button></div>
        </div>
        <div class="recovery-filters" aria-label="Recovery filters">
            <label class="recovery-search"><span class="sr-only">Search recoverable records</span><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><input type="search" id="recovery-search" placeholder="Search records"></label>
            <label><span class="sr-only">Record type</span><select id="recovery-type"><option value="">All types</option><option value="ingredient">Ingredients</option><option value="journal">Journal entries</option></select></label>
        </div>
        <p id="recovery-count" class="recovery-count" aria-live="polite">0 records</p>
        <p id="recovery-feedback" class="recovery-feedback hidden" role="status" aria-live="polite"></p>
        <div class="recovery-table-wrap">
            <table class="recovery-table">
                <thead><tr><th>Record</th><th>Type</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
                <tbody id="recovery-table-body"><tr><td colspan="5" class="recovery-empty">Loading recoverable records…</td></tr></tbody>
            </table>
        </div>
    </div>
</section>
