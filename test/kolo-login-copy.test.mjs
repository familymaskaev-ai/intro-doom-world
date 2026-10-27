// П1: kolo-login here is an exact copy from kolo-core (scripts/kolo-login-sync.mjs). Never edit it by hand.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const dir = new URL('../src/', import.meta.url);
const lines = readFileSync(new URL('kolo-login.sha256', dir), 'utf8').split('\n').filter((l) => /^[0-9a-f]{64}  /.test(l));

test('kolo-login copy matches kolo-core fingerprints', () => {
  assert.ok(lines.some((l) => l.endsWith('  kolo-login.mjs')));
  for (const line of lines) {
    const [hash, name] = line.split('  ');
    const have = createHash('sha256').update(readFileSync(new URL(name, dir))).digest('hex');
    assert.equal(have, hash, `${name} differs from kolo-core: run kolo-core scripts/kolo-login-sync.mjs --all`);
  }
});
