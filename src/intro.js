/**
 * Skippable Doom-world intro: briefing → handoff to game3 arena.
 * First visit paced ~1.5–2 min; return short. Always skippable. Language ru|en.
 */

import { L, rememberLang } from './i18n.js';
import { stringsFor, RETURN_GREETING_SLOT } from './strings.js';
import { bumpVisitCount, buildNextUrl, optionsFromLocation, INTRO_BRIDGE } from './bridge.js';
import { INTRO_PACE, scheduleFor, assertPaceStandard } from './pace.js';
import { mountHeroes } from './heroes.js';
import { createLoginClient } from './kolo-login.mjs';
import { readUrls } from './urls.js';

function loginClient() {
  const core = (readUrls().coreUrl || '').replace(/\/$/, '');
  if (!core) return null;
  // Б6 (core 1.6.19): the login lives in the core's HttpOnly cookie, storage keeps only a "signed in" mark
  return createLoginClient({ coreUrl: core, service: 'doom-world', cookie: true });
}

/** Б6: a 30-day Bearer left in storage by older versions is closed on the core and forgotten. */
async function dropOldLogin() {
  let old = null;
  try { old = localStorage.getItem('kolo.token'); } catch (_) {}
  if (!old) return;
  const core = (readUrls().coreUrl || '').replace(/\/$/, '');
  if (core) {
    try {
      await fetch(`${core}/auth/logout`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${old}` },
        body: '{}'
      });
    } catch (_) {}
  }
  try { localStorage.removeItem('kolo.token'); } catch (_) {}
}

/** Attach one-time ?handoff= — never put Bearer / token= in the next URL. */
async function withHandoff(targetHref) {
  if (!targetHref) return targetHref;
  const kolo = loginClient();
  if (!kolo || !kolo.getToken()) return targetHref;
  try {
    const r = await kolo.linkWithHandoff(targetHref);
    if (r.status < 300 && r.data && r.data.url) return r.data.url;
  } catch (_) {}
  return targetHref;
}

const VERSION = '0.1.1';

/** @type {{ lang: string, visit: string, next: string|null, from: string, account: string|null, reason: string|null, finished: boolean, beat: number }} */
let state = {
  lang: 'en',
  visit: 'first',
  next: null,
  from: 'other',
  account: null,
  reason: null,
  finished: false,
  beat: 0
};

/** @type {(url: string) => void} */
// Поправка 3: leaving the intro goes through the splash in the colours of the next world (kolo-ui); without it, at once
let navigate = (url) => {
  const K = typeof window !== 'undefined' ? window.KoloUI : null;
  if (K && typeof K.go === 'function') K.go(url);
  else location.assign(url);
};
if (typeof window !== 'undefined' && window.KoloUI && typeof window.KoloUI.arrive === 'function') window.KoloUI.arrive('doom-intro');

/** @type {((info: object) => void) | null} */
let onFinish = null;

/** @type {ReturnType<typeof setTimeout>[]} */
let timers = [];

function $(sel, root = document) {
  return root.querySelector(sel);
}

function clearTimers() {
  for (const id of timers) clearTimeout(id);
  timers = [];
}

export function applyBeat(root, s, beatIndex) {
  const beat = (s.beats && s.beats[beatIndex]) || s.beats[0];
  const set = (sel, text, attr) => {
    const el = $(sel, root);
    if (!el) return;
    if (attr) el.setAttribute(attr, text);
    else el.textContent = text;
  };
  set('[data-i18n="brand"]', s.brand);
  set('[data-i18n="brandSub"]', s.brandSub);
  set('[data-i18n="who"]', s.who);
  set('[data-i18n="sub"]', s.sub);
  set('[data-i18n="title"]', beat.title);
  set('[data-i18n="line"]', beat.line);
  set('[data-i18n="continue"]', s.continue);
  set('[data-i18n="skip"]', s.skip);
  set('[data-i18n="skip"]', s.skipAria, 'aria-label');

  const thought = $('[data-i18n="thought"]', root);
  if (thought) {
    if (beat.thought) {
      thought.hidden = false;
      thought.textContent = beat.thought;
    } else {
      thought.hidden = true;
      thought.textContent = '';
    }
  }

  const progress = $('#intro-progress');
  if (progress && s.beats) {
    const n = s.beats.length;
    progress.hidden = false;
    progress.setAttribute('aria-valuemax', String(n));
    progress.setAttribute('aria-valuenow', String(beatIndex + 1));
    progress.style.setProperty('--p', String((beatIndex + 1) / n));
  }

  // root is the document: lang and data-* live on <html> (document.dataset does not exist)
  const html = root.documentElement || root;
  html.lang = state.lang;
  html.dataset.visit = state.visit;
  html.dataset.beat = String(beatIndex);
}

async function finish(reason) {
  if (state.finished) return;
  state.finished = true;
  state.reason = reason;
  clearTimers();

  const skipBtn = $('#intro-skip');
  if (skipBtn) {
    skipBtn.disabled = true;
    skipBtn.textContent = stringsFor(state.lang, state.visit).skipping;
    skipBtn.classList.add('go');
  }
  const cont = $('#intro-continue');
  if (cont) cont.disabled = true;

  bumpVisitCount(typeof localStorage !== 'undefined' ? localStorage : null);
  rememberLang(state.lang, typeof localStorage !== 'undefined' ? localStorage : null);

  let url = buildNextUrl(state.next, {
    lang: state.lang,
    from: state.from,
    account: state.account,
    reason
  });
  url = await withHandoff(url);

  const info = {
    version: VERSION,
    bridge: INTRO_BRIDGE,
    reason,
    visit: state.visit,
    lang: state.lang,
    from: state.from,
    next: url,
    beat: state.beat,
    pace: INTRO_PACE,
    returnSlot: RETURN_GREETING_SLOT
  };

  document.documentElement.classList.add('intro-leaving');
  if (typeof onFinish === 'function') onFinish(info);

  if (url) {
    setTimeout(() => navigate(url), reason === 'skip' ? 40 : 280);
    return;
  }

  const done = $('#intro-done');
  if (done) {
    done.hidden = false;
    done.textContent = stringsFor(state.lang, state.visit).doneNoNext;
  }
}

function armPace(s) {
  clearTimers();
  const schedule = scheduleFor(state.visit);
  const last = schedule[schedule.length - 1];
  const totalMs = last.atMs + last.dwellMs;

  for (const row of schedule) {
    if (row.atMs === 0) continue;
    timers.push(setTimeout(() => {
      if (state.finished) return;
      state.beat = row.index;
      applyBeat(document, s, row.index);
    }, row.atMs));
  }

  // Soft auto-complete at end of paced window (Skip still wins anytime).
  timers.push(setTimeout(() => {
    if (state.finished) return;
    finish('complete');
  }, totalMs));
}

/**
 * @param {object} [opts]
 * @param {string} [opts.lang]
 * @param {'first'|'return'} [opts.visit]
 * @param {string|null} [opts.next]
 * @param {string} [opts.from]
 * @param {string|null} [opts.account]
 * @param {HTMLElement} [opts.root]
 * @param {(url: string) => void} [opts.navigate]
 * @param {(info: object) => void} [opts.onFinish]
 * @param {boolean} [opts.autoPace] default true; false for unit/manual control
 */
export async function start(opts = {}) {
  assertPaceStandard();

  try {
    await dropOldLogin();
    const kolo = loginClient();
    if (kolo) await kolo.takeHandoffFromUrl();
  } catch (_) {}

  const loc = optionsFromLocation(
    typeof location !== 'undefined' ? location.search : '',
    typeof location !== 'undefined' ? location.hash : '',
    typeof localStorage !== 'undefined' ? localStorage : null,
    typeof navigator !== 'undefined' ? navigator.language : '',
    typeof document !== 'undefined' ? document : null
  );

  state = {
    lang: opts.lang || loc.lang,
    visit: opts.visit || loc.visit,
    next: opts.next != null ? opts.next : loc.next,
    from: opts.from || loc.from,
    account: opts.account != null ? opts.account : loc.account,
    reason: null,
    finished: false,
    beat: 0
  };

  if (opts.navigate) navigate = opts.navigate;
  if (opts.onFinish) onFinish = opts.onFinish;

  const s = stringsFor(state.lang, state.visit);
  applyBeat(document, s, 0);

  const stage = $('#holo-mount');
  // Ivan 30.10: the heroes of Doom instead of the arena outline (arena.js stays for reference)
  if (stage && !stage.querySelector('.holo-stage')) mountHeroes(stage, { lang: state.lang });

  const skip = $('#intro-skip');
  if (skip) {
    const skipNow = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      finish('skip');
    };
    for (const ev of ['pointerdown', 'click', 'touchend']) {
      skip.addEventListener(ev, skipNow, { passive: false });
    }
  }

  const cont = $('#intro-continue');
  if (cont) cont.addEventListener('click', (e) => { e.preventDefault(); finish('complete'); });

  const onKey = (e) => {
    if (state.finished) return;
    if (!['Escape'].includes(e.code) && e.key !== 'Escape') return;
    if (e.repeat) return;
    finish('skip');
  };
  window.addEventListener('keydown', onKey);

  const autoPace = opts.autoPace !== false;
  if (autoPace) armPace(s);

  document.documentElement.classList.add('intro-ready');
  return getState();
}

export function skip() { finish('skip'); }
export function complete() { finish('complete'); }

export function getState() {
  return {
    version: VERSION,
    bridge: INTRO_BRIDGE,
    lang: state.lang,
    visit: state.visit,
    next: state.next,
    from: state.from,
    finished: state.finished,
    reason: state.reason,
    beat: state.beat,
    pace: INTRO_PACE,
    returnSlot: RETURN_GREETING_SLOT
  };
}

if (typeof window !== 'undefined') {
  window.DoomIntro = {
    version: VERSION,
    bridge: INTRO_BRIDGE,
    pace: INTRO_PACE,
    start,
    skip,
    complete,
    getState,
    L: (en, ru) => L(state.lang, en, ru),
    RETURN_GREETING_SLOT
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => start());
  } else if ($('#intro-skip')) {
    start();
  }
}
