// Поправка 3: kolo-ui here is an exact copy from kolo-core (scripts/kolo-ui-sync.mjs). Never edit it by hand.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const dir = new URL('../src/', import.meta.url);

test('kolo-ui copy matches the kolo-core fingerprint', () => {
  const line = readFileSync(new URL('kolo-ui.sha256', dir), 'utf8').split('\n').find((l) => l.endsWith('  kolo-ui.js'));
  assert.ok(line);
  const have = createHash('sha256').update(readFileSync(new URL('kolo-ui.js', dir))).digest('hex');
  assert.equal(have, line.split('  ')[0], 'kolo-ui.js differs from kolo-core: run kolo-core scripts/kolo-ui-sync.mjs --all ..');
});

test('the intro loads kolo-ui before itself and leaves through its splash', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(html.indexOf('src/kolo-ui.js') > 0 && html.indexOf('src/kolo-ui.js') < html.indexOf('src/intro.js'));
  const js = readFileSync(new URL('intro.js', dir), 'utf8');
  assert.match(js, /K\.go\(url\)/);
  assert.match(js, /else location\.assign\(url\);/);
});
