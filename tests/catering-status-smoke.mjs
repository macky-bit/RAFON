import assert from 'node:assert/strict';
import { effectiveEventStatus } from '../js/components/dashboard.js';

const today = '2026-10-17';
assert.equal(effectiveEventStatus({ status: 'Upcoming', eventDate: '2026-10-16' }, today), 'Completed');
assert.equal(effectiveEventStatus({ status: 'Upcoming', eventDate: today }, today), 'Upcoming');
assert.equal(effectiveEventStatus({ status: 'Upcoming', eventDate: '2026-10-18' }, today), 'Upcoming');
assert.equal(effectiveEventStatus({ status: 'Cancelled', eventDate: '2026-10-16' }, today), 'Cancelled');
assert.equal(effectiveEventStatus({ status: 'Completed', eventDate: '2026-10-18' }, today), 'Completed');
console.log('Catering event status checks passed.');
