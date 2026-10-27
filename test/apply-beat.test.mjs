// The intro boots with applyBeat(document, …): document has no dataset, so lang and data-* must go on <html>.
// Before this fix the boot threw «Cannot set properties of undefined (setting 'visit')» and Skip never worked
// (found by the player-path browser test, game2 npm run e2e).
import { it } from 'node:test';
import assert from 'node:assert/strict';
import { applyBeat } from '../src/intro.js';
import { stringsFor } from '../src/strings.js';

it('applyBeat on the document writes lang and data-* to <html>', () => {
  const html = { dataset: {}, lang: '' };
  const doc = { documentElement: html, querySelector: () => null, querySelectorAll: () => [] };
  globalThis.document = doc; // applyBeat also looks some nodes up on the page itself
  assert.doesNotThrow(() => applyBeat(doc, stringsFor('ru', 'first'), 0));
  assert.equal(html.dataset.beat, '0');
  assert.ok(html.dataset.visit);
  assert.ok(html.lang);
});
