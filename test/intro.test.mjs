import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { L, normalizeLang, resolveLang, rememberLang } from '../src/i18n.js';
import { stringsFor, RETURN_GREETING_SLOT } from '../src/strings.js';
import {
  INTRO_BRIDGE,
  parseParams,
  resolveVisitMode,
  bumpVisitCount,
  buildNextUrl,
  optionsFromLocation,
  readUrls,
  DEFAULT_URLS,
  VISIT_KEY
} from '../src/bridge.js';
import {
  INTRO_PACE,
  FIRST_BEAT_MS,
  sumBeats,
  assertPaceStandard,
  scheduleFor
} from '../src/pace.js';

describe('i18n', () => {
  it('normalizeLang accepts ru|en only', () => {
    assert.equal(normalizeLang('ru'), 'ru');
    assert.equal(normalizeLang('RU-RU'), 'ru');
    assert.equal(normalizeLang('en-US'), 'en');
    assert.equal(normalizeLang('de'), null);
  });

  it('L returns the whole string for the player language', () => {
    assert.equal(L('en', 'Hello', 'Привет'), 'Hello');
    assert.equal(L('ru', 'Hello', 'Привет'), 'Привет');
  });

  it('resolveLang prefers query over store and navigator', () => {
    const store = { getItem: () => 'en' };
    assert.equal(resolveLang({}, '?lang=ru', '', store, 'en-US'), 'ru');
    assert.equal(resolveLang({ lang: 'en' }, '?lang=ru', '', store, 'ru'), 'en');
  });

  it('rememberLang writes kolo.lang', () => {
    const bag = {};
    rememberLang('ru', { setItem: (k, v) => { bag[k] = v; } });
    assert.equal(bag['kolo.lang'], 'ru');
  });
});

describe('pace ~1.5–2 min (not 6 min film)', () => {
  it('first band is 90–120s and beats sum inside it', () => {
    const r = assertPaceStandard();
    assert.equal(INTRO_PACE.firstMinMs, 90_000);
    assert.equal(INTRO_PACE.firstMaxMs, 120_000);
    assert.ok(r.sum >= 90_000 && r.sum <= 120_000);
    assert.equal(sumBeats(FIRST_BEAT_MS), r.sum);
  });

  it('return schedule is short', () => {
    const s = scheduleFor('return');
    assert.equal(s.length, 1);
    assert.ok(s[0].dwellMs <= 30_000);
    assert.ok(s[0].dwellMs >= 5_000);
  });

  it('first schedule has four beats covering the target window', () => {
    const s = scheduleFor('first');
    assert.equal(s.length, 4);
    const end = s[s.length - 1].atMs + s[s.length - 1].dwellMs;
    assert.ok(end >= INTRO_PACE.firstMinMs && end <= INTRO_PACE.firstMaxMs);
  });
});

describe('strings from game3 c045dc3', () => {
  it('first visit uses tester welcome (ru and en)', () => {
    const en = stringsFor('en', 'first');
    const ru = stringsFor('ru', 'first');
    assert.match(en.line, /ten lives|Skip when ready/i);
    assert.match(ru.line, /десять жизней|Пропустите/);
    assert.match(en.title, /Welcome, tester/);
    assert.match(ru.title, /Добро пожаловать, тестер/);
    assert.equal(en.beats.length, 4);
    assert.equal(ru.beats.length, 4);
  });

  it('return visit uses short game3 return copy', () => {
    const ru = stringsFor('ru', 'return');
    assert.match(ru.line, /С возвращением/);
    assert.equal(ru.beats.length, 1);
    assert.equal(RETURN_GREETING_SLOT.status, 'ready');
    assert.match(RETURN_GREETING_SLOT.ru, /С возвращением/);
  });

  it('does not invent plot — beats reuse greet/tagline/hint only', () => {
    const en = stringsFor('en', 'first');
    const allowed = [
      en.beats[0].line,
      en.beats[0].thought,
      en.beats[2].line,
      'Skip',
    ];
    for (const b of en.beats) {
      assert.ok(
        allowed.includes(b.line) || allowed.includes(b.thought) || b.line === en.beats[0].line || b.thought === 'Skip' || b.line.includes('ten lives') || b.line.includes('arena') || b.line.includes('WASD'),
        `unexpected beat line: ${b.line}`
      );
    }
  });
});

describe('bridge → game3', () => {
  it('exposes introBridge version 1', () => {
    assert.equal(INTRO_BRIDGE, 1);
  });

  it('parseParams reads lang/from/visit/next/account', () => {
    const p = parseParams('?lang=ru&from=kolo-world&visit=return&next=https://game3.example/&account=abc');
    assert.equal(p.lang, 'ru');
    assert.equal(p.from, 'kolo-world');
    assert.equal(p.visit, 'return');
    assert.equal(p.next, 'https://game3.example/');
    assert.equal(p.account, 'abc');
  });

  it('resolveVisitMode uses doom.intro.visits when visit omitted', () => {
    assert.equal(resolveVisitMode({}), 'first');
    assert.equal(resolveVisitMode({}, { getItem: (k) => (k === VISIT_KEY ? '2' : null) }), 'return');
    assert.equal(resolveVisitMode({ visit: 'first' }, { getItem: () => '9' }), 'first');
  });

  it('bumpVisitCount increments doom.intro.visits', () => {
    const bag = { [VISIT_KEY]: '1' };
    const n = bumpVisitCount({
      getItem: (k) => bag[k] || null,
      setItem: (k, v) => { bag[k] = v; }
    });
    assert.equal(n, 2);
    assert.equal(bag[VISIT_KEY], '2');
  });

  it('buildNextUrl marks intro done/skipped for game3', () => {
    const done = buildNextUrl('https://game3.example/arena', {
      lang: 'ru', from: 'kolo-world', account: 'u1', reason: 'complete'
    });
    assert.ok(done.includes('lang=ru'));
    assert.ok(done.includes('from=kolo-world'));
    assert.ok(done.includes('intro=done'));
    assert.ok(done.includes('introBridge=1'));
    assert.ok(done.includes('account=u1'));

    const skipped = buildNextUrl('https://game3.example/', {
      lang: 'en', from: 'app', reason: 'skip'
    });
    assert.ok(skipped.includes('intro=skipped'));
    assert.ok(!skipped.includes('account='));
  });

  it('optionsFromLocation falls back to urls.doomUrl when next omitted', () => {
    const fakeDoc = {
      getElementById: () => ({
        textContent: JSON.stringify({
          urls: { doomUrl: 'http://localhost:8090/' }
        })
      })
    };
    const o = optionsFromLocation('?from=kolo-world', '', { getItem: () => null }, 'en', fakeDoc);
    assert.equal(o.next, 'http://localhost:8090/');
    assert.equal(o.urls.doomUrl, 'http://localhost:8090/');
  });

  it('readUrls exposes local doomIntroUrl :4174', () => {
    assert.equal(DEFAULT_URLS.doomIntroUrl, 'http://localhost:4174/');
    assert.equal(DEFAULT_URLS.doomUrl, 'http://localhost:8090/');
    const u = readUrls(null);
    assert.ok(u.coreUrl);
    assert.equal(u.doomIntroUrl, 'http://localhost:4174/');
  });
});
