/**
 * Handoff: intro-doom-world → game3-doom-world (arena).
 * Entry from plaza portal (from=kolo-world), game1, app, or direct URL.
 *
 * Query (optional except next for a real handoff):
 *   lang=ru|en
 *   next=<game3 arena URL>
 *   from=kolo-world|game1|app|other
 *   visit=first|return
 *   account=<opaque id — never a secret>
 */

import { normalizeLang, resolveLang } from './i18n.js';
import { readUrls, DEFAULT_URLS } from './urls.js';

export const INTRO_BRIDGE = 1;
export { readUrls, DEFAULT_URLS };

const FROM_OK = new Set(['kolo-world', 'game1', 'app', 'other']);
const VISIT_KEY = 'doom.intro.visits';

/** @param {string} search @param {string} [hash] */
export function parseParams(search = '', hash = '') {
  const q = new URLSearchParams(String(search || '').replace(/^\?/, ''));
  const hRaw = String(hash || '').replace(/^#/, '');
  const h = hRaw.includes('=') ? new URLSearchParams(hRaw) : new URLSearchParams();

  const get = (k) => {
    const a = q.get(k);
    if (a != null && a !== '') return a;
    const b = h.get(k);
    if (b != null && b !== '') return b;
    return null;
  };

  const fromRaw = (get('from') || 'other').toLowerCase();
  const visitRaw = (get('visit') || '').toLowerCase();

  return {
    lang: normalizeLang(get('lang')),
    next: get('next'),
    from: FROM_OK.has(fromRaw) ? fromRaw : 'other',
    visit: visitRaw === 'return' || visitRaw === 'first' ? visitRaw : null,
    account: get('account')
  };
}

/**
 * @param {{ visit?: string | null }} params
 * @param {{ getItem?: (k: string) => string | null }} [store]
 */
export function resolveVisitMode(params, store = null) {
  if (params && (params.visit === 'return' || params.visit === 'first')) return params.visit;
  let n = 0;
  try {
    n = parseInt((store && store.getItem && store.getItem(VISIT_KEY)) || '0', 10) || 0;
  } catch (_) { n = 0; }
  return n > 0 ? 'return' : 'first';
}

/** @param {{ getItem?: Function, setItem?: Function }} [store] */
export function bumpVisitCount(store) {
  let n = 0;
  try {
    n = parseInt((store && store.getItem && store.getItem(VISIT_KEY)) || '0', 10) || 0;
    if (store && store.setItem) store.setItem(VISIT_KEY, String(n + 1));
  } catch (_) { /* ignore */ }
  return n + 1;
}

/**
 * @param {string | null | undefined} next
 * @param {{ lang: string, from: string, account?: string | null, reason: 'skip' | 'complete' }} ctx
 */
export function buildNextUrl(next, ctx) {
  if (!next) return null;
  let u;
  try {
    u = new URL(next, 'http://local.invalid');
  } catch (_) {
    return null;
  }
  u.searchParams.set('lang', ctx.lang === 'ru' ? 'ru' : 'en');
  u.searchParams.set('from', ctx.from || 'other');
  u.searchParams.set('intro', ctx.reason === 'skip' ? 'skipped' : 'done');
  u.searchParams.set('introBridge', String(INTRO_BRIDGE));
  if (ctx.account) u.searchParams.set('account', ctx.account);

  if (String(next).startsWith('http://') || String(next).startsWith('https://') || String(next).startsWith('//')) {
    return u.toString();
  }
  return u.pathname + u.search + u.hash;
}

/**
 * If `next` is missing, falls back to urls.doomUrl (local arena :8090).
 */
export function optionsFromLocation(search, hash, store, navLang, doc) {
  const params = parseParams(search, hash);
  const lang = resolveLang({ lang: params.lang || undefined }, search, hash, store, navLang);
  const visit = resolveVisitMode(params, store);
  const urls = readUrls(doc);
  const next = params.next || urls.doomUrl || null;
  return {
    lang,
    visit,
    next,
    from: params.from,
    account: params.account,
    bridge: INTRO_BRIDGE,
    urls
  };
}

export { VISIT_KEY };
