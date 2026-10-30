/**
 * Ivan 30.10: «вместо этой заставки я хотел, чтобы были какие-то наши герои из Дума. И так в каждом мире».
 * The intro shows the heroes of its world in a row: one steps into the light, his name below, then the next.
 *
 * Add a hero (heroes are still being made): put his picture into img/heroes/ (a figure on a dark background, about
 * 200×360, webp or png) and add one line to HEROES. The order here is the order on screen. No 3D models are loaded:
 * the intro stays light on a phone.
 * The four now are the account avatars every player chooses from (kolo-heroes avatars/v1, the core library's look).
 */
export const HEROES = [
  { id: 'gold', name: { ru: 'Золото', en: 'Gold' }, img: 'img/heroes/gold.webp' },
  { id: 'steel', name: { ru: 'Андроид', en: 'Android' }, img: 'img/heroes/steel.webp' },
  { id: 'copper', name: { ru: 'Древесный', en: 'Wooden' }, img: 'img/heroes/copper.webp' },
  { id: 'violet', name: { ru: 'Аметист', en: 'Amethyst' }, img: 'img/heroes/violet.webp' },
];

const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/**
 * @param {HTMLElement} mount
 * @param {{ lang?: string, heroes?: Array<{ id: string, name: { ru: string, en: string }, img?: string, html?: string }>, every?: number, start?: number }} [opts]
 */
export function mountHeroes(mount, opts = {}) {
  if (!mount) return null;
  const list = (opts.heroes || HEROES).filter((h) => h && (h.img || h.html));
  const ru = opts.lang === 'ru';
  const n = list.length;
  mount.innerHTML = `
    <div class="holo-stage heroes-stage" role="img" aria-label="${esc(list.map((h) => (ru ? h.name.ru : h.name.en)).join(', '))}">
      <div class="holo-pedestal"></div>
      <div class="holo-beam heroes-beam"></div>
      <div class="heroes-row">
        ${list.map((h, i) => `<figure class="hero" data-id="${esc(h.id)}" style="--i:${i - (n - 1) / 2}">
          ${h.html ? `<div class="hero-art">${h.html}</div>` : `<img class="hero-art" src="${esc(h.img)}" alt="" decoding="async" draggable="false">`}
        </figure>`).join('')}
      </div>
      <p class="hero-name" aria-hidden="true"></p>
      <div class="holo-flicker"></div>
    </div>`;
  const stage = mount.querySelector('.heroes-stage');
  const figs = [...stage.querySelectorAll('.hero')];
  const label = stage.querySelector('.hero-name');
  let k = Math.max(0, Math.min(n - 1, opts.start || 0));
  const show = () => {
    figs.forEach((f, i) => f.classList.toggle('on', i === k));
    const h = list[k];
    if (h) label.textContent = ru ? h.name.ru : h.name.en;
  };
  // the spotlight walks along the row; images that fail to load step out of the row
  figs.forEach((f) => {
    const img = f.querySelector('img');
    if (img) img.addEventListener('error', () => { f.hidden = true; }, { once: true });
  });
  show();
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (n > 1 && !reduce) {
    const timer = setInterval(() => {
      if (!stage.isConnected) return clearInterval(timer);
      for (let step = 0; step < n; step++) {
        k = (k + 1) % n;
        if (!figs[k].hidden) break;
      }
      show();
    }, opts.every || 2600);
  }
  return stage;
}
