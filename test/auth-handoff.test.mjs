import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

test('intro finish uses handoff, never token=', async () => {
  const intro = await readFile(join(ROOT, 'src/intro.js'), 'utf8');
  assert.match(intro, /withHandoff|linkWithHandoff/);
  assert.match(intro, /takeHandoffFromUrl/);
  assert.match(intro, /kolo-login/);
  assert.doesNotMatch(intro, /searchParams\.set\(\s*['"]token['"]/);
  assert.doesNotMatch(intro, /koloToken=/);
  assert.doesNotMatch(intro, /\?token=/);
});

test('bridge buildNextUrl never sets token=', async () => {
  const bridge = await readFile(join(ROOT, 'src/bridge.js'), 'utf8');
  assert.doesNotMatch(bridge, /searchParams\.set\(\s*['"]token['"]/);
  assert.doesNotMatch(bridge, /\?token=/);
  assert.doesNotMatch(bridge, /koloToken=/);
});

test('kolo-login.mjs ships handoff endpoints', async () => {
  const js = await readFile(join(ROOT, 'src/kolo-login.mjs'), 'utf8');
  assert.match(js, /\/auth\/handoff/);
  assert.match(js, /createLoginClient/);
  assert.match(js, /linkWithHandoff/);
  assert.match(js, /takeHandoffFromUrl/);
});

// Б6 (core 1.6.19): the intro keeps the login in the core's cookie, never a Bearer in storage
test('intro signs in with the core cookie and drops an old kolo.token', async () => {
  const js = await readFile(join(ROOT, 'src/intro.js'), 'utf8');
  assert.match(js, /createLoginClient\(\{ coreUrl: core, service: 'doom-world', cookie: true \}\)/);
  assert.match(js, /removeItem\('kolo.token'\)/);
  assert.match(js, /await dropOldLogin\(\);\s*const kolo = loginClient\(\);/);
});
