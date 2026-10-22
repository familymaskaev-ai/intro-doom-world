/**
 * Soft arena silhouette (CSS/SVG) — no Doom WAD assets.
 */

export function arenaSVG() {
  return `
<svg class="holo-svg arena-svg" viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="arenaFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffb070" stop-opacity="0.55"/>
      <stop offset="55%" stop-color="#e07040" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#703020" stop-opacity="0.12"/>
    </linearGradient>
    <filter id="arenaGlow" x="-30%" y="-20%" width="160%" height="140%">
      <feGaussianBlur stdDeviation="1.2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <g fill="none" stroke="url(#arenaFill)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" filter="url(#arenaGlow)">
    <!-- corridor walls -->
    <path d="M20 190 L55 40 L105 40 L140 190"/>
    <path d="M55 40 L70 18 L90 18 L105 40"/>
    <!-- floor lines -->
    <path d="M35 150 H125"/>
    <path d="M42 120 H118"/>
    <path d="M48 90 H112"/>
    <!-- door / exit -->
    <rect x="68" y="55" width="24" height="38" rx="2"/>
    <!-- ammo crate hint -->
    <path d="M30 170 h18 v12 h-18 z"/>
    <path d="M112 168 h20 v14 h-20 z"/>
  </g>
  <g class="holo-scan" stroke="#ffc090" stroke-opacity="0.35" stroke-width="0.6">
    <path d="M40 70 H120"/><path d="M36 100 H124"/><path d="M32 130 H128"/>
  </g>
</svg>`;
}

/** @param {HTMLElement} mount */
export function mountArena(mount) {
  if (!mount) return null;
  mount.innerHTML = `
    <div class="holo-stage arena-stage" role="img" aria-label="Doom arena">
      <div class="holo-pedestal"></div>
      <div class="holo-beam arena-beam"></div>
      <div class="holo-figure">${arenaSVG()}</div>
      <div class="holo-flicker"></div>
    </div>`;
  return mount.querySelector('.holo-stage');
}
