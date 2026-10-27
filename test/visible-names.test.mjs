// Р10 (rename, kolo-hub docs/architecture/AMENDMENTS.md, Amendment 1): the project is called Maskaevcity.
// No text a person sees in the intro says Kolo / KOLO / Коло. Technical names stay (kolo.token, kolo.lang, kolo-world, KoloLogin, KOLO_*),
// and so does «коло» with a small letter (the currency). Comments and console messages are for developers and are not checked.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const OLD = /\bKolo\b|KOLO(?![_A-Z.])|Коло(?![а-яё])/u;
const LIT = /'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`|\/\/[^\n]*|\/\*[\s\S]*?\*\//g;

function visibleOld(src) {
  const hits = [];
  for (const m of src.matchAll(LIT)) {
    const s = m[0];
    if (s.startsWith('//') || s.startsWith('/*')) continue;
    const line = src.slice(src.lastIndexOf('\n', m.index) + 1, src.indexOf('\n', m.index));
    if (/console\./.test(line)) continue;
    if (OLD.test(s)) hits.push(s.slice(0, 80));
  }
  return hits;
}

test('the intro texts say Maskaevcity, not Kolo', () => {
  const dir = new URL('../src/', import.meta.url);
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.js'))) {
    assert.deepEqual(visibleOld(readFileSync(new URL(f, dir), 'utf8')), [], `src/${f}`);
  }
});

test('the page itself (title and text before the script starts) does not say Kolo', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const shown = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ');
  assert.doesNotMatch(shown, OLD);
});

test('the check itself catches the old name and lets technical names through', () => {
  assert.equal(visibleOld("t('Welcome to Kolo', 'Добро пожаловать в Коло')").length, 2);
  assert.deepEqual(visibleOld("localStorage.getItem('kolo.lang'); x = '50 коло'; // Kolo"), []);
});
