<?php declare(strict_types=1); ?>
<section id="audit-trail-view" class="hidden audit-view">
    <div class="audit-card">
        <div class="audit-card-heading">
            <div class="audit-heading-copy"><div><h2>Activity history</h2><p>Changes to restaurant and accounting records, shown most recent first.</p></div></div>
            <span id="audit-record-count" class="audit-count" aria-live="polite">0 records</span>
        </div>

        <div class="audit-table-wrap">
            <table class="audit-table">
                <thead>
                    <tr>
                        <th class="py-3 px-4">Timestamp</th>
                        <th class="py-3 px-4">User Action</th>
                        <th class="py-3 px-4">Ref Code</th>
                        <th class="py-3 px-4">Details</th>
                        <th class="py-3 px-4">Status</th>
                    </tr>
                </thead>
                <tbody id="audit-trail-body" class="divide-y divide-slate-100">
                    <!-- Dynamic Insert -->
                </tbody>
            </table>
        </div>
    </div>
</section>
