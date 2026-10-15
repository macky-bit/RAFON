<?php declare(strict_types=1); ?>
<section id="audit-trail-view" class="hidden space-y-6">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div class="pb-4 border-b border-slate-200">
            <h2 class="text-xl font-bold text-slate-900">System Audit Trail</h2>
            <p class="text-xs text-slate-500">Timestamped record of posted accounting transactions</p>
        </div>

        <div class="mt-6 overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-600">
                <thead class="bg-slate-50 text-slate-700 uppercase text-[11px] font-semibold border-y border-slate-200">
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
