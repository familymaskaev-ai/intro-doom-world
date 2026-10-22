/**
 * Language = player's language entirely (ru | en).
 * Same rule as game1 L(en, ru): Russian UI → ru, otherwise en.
 */

export const LANGS = Object.freeze(['en', 'ru']);

/** @param {string | null | undefined} raw */
export function normalizeLang(raw) {
  const s = String(raw || '').trim().toLowerCase();
  if (s === 'ru' || s.startsWith('ru-') || s.startsWith('ru_')) return 'ru';
  if (s === 'en' || s.startsWith('en-') || s.startsWith('en_')) return 'en';
  return null;
}

/**
 * Resolve UI language once for the page.
 * Order: explicit opts.lang → ?lang= → #lang= → localStorage kolo.lang → navigator → en
 * @param {Record<string, string>} [opts]
 * @param {string} [search]
 * @param {string} [hash]
 * @param {{ getItem?: (k: string) => string | null }} [store]
 * @param {string} [navLang]
 */
export function resolveLang(opts = {}, search = '', hash = '', store = null, navLang = '') {
  const fromOpts = normalizeLang(opts.lang);
  if (fromOpts) return fromOpts;

  const q = new URLSearchParams(String(search || '').replace(/^\?/, ''));
  const fromQ = normalizeLang(q.get('lang'));
  if (fromQ) return fromQ;

  const h = String(hash || '').replace(/^#/, '');
  if (h) {
    const hp = new URLSearchParams(h.includes('=') ? h : '');
    const fromH = normalizeLang(hp.get('lang'));
    if (fromH) return fromH;
  }

  try {
    const fromStore = store && normalizeLang(store.getItem && store.getItem('kolo.lang'));
    if (fromStore) return fromStore;
  } catch (_) { /* ignore */ }

  const fromNav = normalizeLang(navLang);
  if (fromNav) return fromNav;

  return 'en';
}

/**
 * @param {'en'|'ru'} lang
 * @param {string} en
 * @param {string} ru
 */
export function L(lang, en, ru) {
  return lang === 'ru' ? ru : en;
}

/**
 * Persist choice so a later visit (or embedded host) keeps the same language.
 * @param {'en'|'ru'} lang
 * @param {{ setItem?: (k: string, v: string) => void }} [store]
 */
export function rememberLang(lang, store) {
  const n = normalizeLang(lang) || 'en';
  try {
    if (store && store.setItem) store.setItem('kolo.lang', n);
  } catch (_) { /* ignore */ }
  return n;
}
