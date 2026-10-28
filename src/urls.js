/**
 * Shared KOLO URL config pattern (same keys as game1 / game2 / game3 / intro-kolo).
 * Local defaults until Ivan sets production hosts.
 * doomIntroUrl = this page (:4174). next falls back to doomUrl (arena).
 */

export const DEFAULT_URLS = Object.freeze({
  coreUrl: 'http://localhost:3000',
  introUrl: 'http://localhost:4173/',
  doomIntroUrl: 'http://localhost:4174/',
  koloWorldUrl: 'http://localhost:8080/',
  doomUrl: 'http://localhost:8090/',
  game1Url: 'http://localhost:8123/',
  koloApp: Object.freeze({ url: '', installUrl: '' }),
});

function pick(v) {
  return typeof v === 'string' && v.trim() ? v.trim() : '';
}

// Home Wi-Fi: the addresses say localhost (= the Mac), but a phone opened the intro by the Mac's name
// (MacBook-Air-Ivan.local or 192.168.x.x). There localhost would be the phone itself, so use the page's own host; the port stays.
const LOOPBACK = /^(localhost|127\.0\.0\.1|\[::1\])$/;
const pageHost = () => (typeof location !== 'undefined' && location.hostname) || '';
const pageProto = () => (typeof location !== 'undefined' && location.protocol) || '';

// Through the internet (https, 28.10) every part has its own name next to this page's (Cloudflare tunnel,
// game2 scripts/tunnel/config.example.yml): a home port becomes that part's https address, e.g. on
// https://intro.maskaevcity.com «http://localhost:3000» is https://core.maskaevcity.com.
export const PART_HOST = Object.freeze({ 3000: 'core', 8123: 'play', 8080: 'plaza', 8090: 'doom', 4173: 'intro', 4174: 'doom-intro' });
export function onInternet(u, here) {
  const part = PART_HOST[u.port];
  if (!part) return '';
  const labels = here.split('.');
  const base = labels.length > 2 ? labels.slice(1).join('.') : here;
  return `https://${part}.${base}${u.pathname}${u.search}`;
}

export function onThisMac(raw, here = pageHost(), proto = pageProto()) {
  if (!raw || !here || LOOPBACK.test(here)) return raw;
  try {
    const u = new URL(raw);
    if (!LOOPBACK.test(u.hostname)) return raw;
    if (proto === 'https:') {
      const out = onInternet(u, here);
      return /\/$/.test(raw) || !out ? out : out.replace(/\/$/, '');
    }
    u.hostname = here;
    return /\/$/.test(raw) ? u.href : u.href.replace(/\/$/, '');
  } catch (_) {
    return raw;
  }
}

export function macUrls(o, here = pageHost(), proto = pageProto()) {
  const out = { ...o };
  for (const k of ['coreUrl', 'introUrl', 'doomIntroUrl', 'koloWorldUrl', 'doomUrl', 'game1Url']) {
    if (k in o) out[k] = onThisMac(o[k], here, proto);
  }
  out.koloApp = { url: onThisMac(o.koloApp.url, here, proto), installUrl: onThisMac(o.koloApp.installUrl, here, proto) };
  return out;
}

/**
 * @param {Document | { getElementById?: Function }} [doc]
 * @param {typeof DEFAULT_URLS} [defaults]
 */
export function readUrls(doc = typeof document !== 'undefined' ? document : null, defaults = DEFAULT_URLS) {
  const out = {
    coreUrl: defaults.coreUrl,
    introUrl: defaults.introUrl,
    doomIntroUrl: defaults.doomIntroUrl,
    koloWorldUrl: defaults.koloWorldUrl,
    doomUrl: defaults.doomUrl,
    game1Url: defaults.game1Url,
    koloApp: {
      url: (defaults.koloApp && defaults.koloApp.url) || '',
      installUrl: (defaults.koloApp && defaults.koloApp.installUrl) || '',
    },
  };
  try {
    const el = doc && doc.getElementById && doc.getElementById('intro-config');
    if (!el) return macUrls(out);
    const d = JSON.parse(el.textContent || '{}');
    const u = d.urls || {};
    if (pick(u.coreUrl)) out.coreUrl = pick(u.coreUrl);
    if (pick(u.introUrl)) out.introUrl = pick(u.introUrl);
    if (pick(u.doomIntroUrl)) out.doomIntroUrl = pick(u.doomIntroUrl);
    if (pick(u.koloWorldUrl)) out.koloWorldUrl = pick(u.koloWorldUrl);
    if (pick(u.doomUrl)) out.doomUrl = pick(u.doomUrl);
    if (pick(u.game1Url)) out.game1Url = pick(u.game1Url);
    const app = u.koloApp || {};
    if (pick(app.url)) out.koloApp.url = pick(app.url);
    if (pick(app.installUrl)) out.koloApp.installUrl = pick(app.installUrl);
  } catch (_) { /* keep defaults */ }
  return macUrls(out);
}
