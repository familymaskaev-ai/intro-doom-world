// Ivan 30.10: the intro shows the heroes of its world instead of a splash; heroes are added with one line + a picture.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('the intro mounts the heroes of its world', () => {
  const intro = read('src/intro.js');
  assert.match(intro, /import \{ mountHeroes[^}]*\} from '\.\/heroes\.js';/);
  assert.match(intro, /mountHeroes\(stage, \{ lang: state\.lang/);
});

test('every hero has a Russian and an English name and a picture that is in the repository', () => {
  const src = read('src/heroes.js');
  const rows = [...src.matchAll(/\{ id: '([a-z-]+)', name: \{ ru: '([^']+)', en: '([^']+)' \}, (img: '([^']+)'|html: )/g)];
  assert.ok(rows.length >= 4, 'at least the four account avatars');
  for (const r of rows) {
    if (r[5]) assert.ok(fs.existsSync(new URL(`../${r[5]}`, import.meta.url)), `${r[1]}: ${r[5]} is missing`);
  }
  for (const id of ['gold', 'steel', 'copper', 'violet']) assert.ok(rows.some((r) => r[1] === id), id);
  assert.doesNotMatch(src, /fresco/i, 'Fresco is never shown as a player avatar');
});
