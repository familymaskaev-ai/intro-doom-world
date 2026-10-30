/* kolo-ui.js — made from kolo-core packages/kolo-ui/kolo-ui.src.js by scripts/kolo-ui-sync.mjs. Do not edit. */
/**
 * kolo-ui — one menu, one camera and one world-to-world splash for every Maskaevcity world (Поправка 3, kolo-hub
 * docs/architecture/AMENDMENTS.md). Plain script, no imports, no three.js: each world keeps its own scene and code.
 *
 * Source: kolo-core packages/kolo-ui/kolo-ui.src.js. scripts/kolo-ui-sync.mjs puts the four avatar pictures in and
 * makes kolo-ui.js, which every world keeps a copy of. Never edit a world's copy by hand.
 *
 *   KoloUI.init({ world: "plaza", lang: () => "ru", adopt: [{ sel: "#kolo-pill", to: "me" }, …], help: { ru, en } })
 *     (corner: "right" puts the button top right; summary: () => "Name · 2 online" for the line on the button)
 *     one compact button in the corner; a tap opens the menu (a sheet from below on a phone). Buttons the world already
 *     has (account, app, sound, places…) are moved into the menu and keep working as before.
 *   KoloUI.item({ to: "here", ru, en, icon, run })   — one more button in the menu
 *   const cam = KoloUI.camera({ dist: 4.2, min: 1.6, max: 10 })   — wheel / pinch / B key, smooth, first person below min
 *     (pinch: false when the world pinches itself and calls cam.zoom(k); wheel: e => false to keep a wheel for the world)
 *   cam.tick(dt) → { dist, fp }   dist: metres behind the eyes (0 = first person), fp: 0 third … 1 first person
 *   KoloUI.orbit(pivot, yaw, pitch, dist) → { x, y, z, lx, ly, lz }   camera place and look point, seamless down to 0
 *   KoloUI.go(url, { to })   — the splash with the four avatars, then the page goes (to: plaza | doom | sfz | app)
 *   KoloUI.toast(text, ms)   — a short hint that goes away by itself
 *   KoloUI.arrive("intro")   — only the fade in from another world, without the menu (the intros)
 */
(function (global) {
  "use strict";
  if (global.KoloUI && global.KoloUI.version) return;
  const VERSION = "1.0.0";
  const AVATARS = {"gold":"data:image/webp;base64,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","steel":"data:image/webp;base64,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","copper":"data:image/webp;base64,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","violet":"data:image/webp;base64,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"}; // { gold, steel, copper, violet }: data: pictures, put in by scripts/kolo-ui-sync.mjs
  const D = global.document;
  const LS = {
    get(k) { try { return global.localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { global.localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  const S = { world: "", lang: null, open: false, items: [], adopt: [], cam: null, built: false, hideWhen: "" };
  const lang = () => {
    let l = "";
    try { l = S.lang ? S.lang() : ""; } catch (e) { l = ""; }
    if (!l) l = (D && D.documentElement.lang) || "ru";
    return String(l).toLowerCase().startsWith("en") ? "en" : "ru";
  };
  const L = (en, ru) => (lang() === "en" ? en : ru);
  const phone = () => (global.matchMedia && (global.matchMedia("(pointer: coarse)").matches || global.matchMedia("(max-width: 640px)").matches));

  // ───────────── worlds: names and colours (also used by the splash) ─────────────
  const WORLDS = {
    plaza: { en: "Zero Square", ru: "Площадь Нуля", a: "#ffd27a", b: "#2a1c0c", c: "#0b0f18" },
    sfz: { en: "Start From Zero", ru: "Start From Zero", a: "#ffb36b", b: "#3a1830", c: "#0a1630" },
    doom: { en: "Doom", ru: "Doom", a: "#ff5a2a", b: "#3a0b05", c: "#0c0507" },
    app: { en: "Maskaevcity app", ru: "Приложение Maskaevcity", a: "#b48cff", b: "#22143f", c: "#0b0914" },
  };
  WORLDS.intro = WORLDS.plaza;
  WORLDS["doom-intro"] = WORLDS.doom;
  // where a link leads: by the part's own name on the internet, or by its port at home (kolo-hub docs/URLS.md)
  function worldOf(url) {
    let u;
    try { u = new URL(url, global.location ? global.location.href : "http://localhost/"); } catch (e) { return "plaza"; }
    const host = u.hostname.split(".")[0], port = u.port;
    if (/\/app(\/|$)/.test(u.pathname) || host === "core" || port === "3000") return "app";
    if (host === "doom" || host === "doom-intro" || port === "8090" || port === "4174") return "doom";
    if (host === "play" || port === "8123") return "sfz";
    return "plaza";
  }

  // ───────────── styles ─────────────
  const CSS = `
.kui-chip{position:fixed;left:calc(10px + env(safe-area-inset-left,0px));top:calc(10px + env(safe-area-inset-top,0px));z-index:9500;
  display:flex;align-items:center;gap:8px;max-width:min(320px,calc(100vw - 20px));padding:6px 12px 6px 8px;border-radius:999px;cursor:pointer;
  font:600 14px/1.15 "Barlow Condensed",system-ui,-apple-system,sans-serif;letter-spacing:.03em;color:#f6ead2;background:rgba(14,12,10,.55);
  border:1px solid rgba(255,214,140,.32);box-shadow:0 2px 12px rgba(0,0,0,.35);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);
  -webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;pointer-events:auto}
.kui-chip:hover{border-color:rgba(255,214,140,.6)}
.kui-chip .kui-burger{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:linear-gradient(#ffe08a,#f2b53c);color:#1b1408;font-size:14px;flex:none}
.kui-chip .kui-sum{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kui-chip .kui-dot{width:7px;height:7px;border-radius:50%;background:#5dff9a;flex:none;box-shadow:0 0 6px #5dff9a}
.kui-chip[data-open="1"]{visibility:hidden}
.kui-shade{position:fixed;inset:0;z-index:9590;background:rgba(0,0,0,.28);opacity:0;transition:opacity .18s;pointer-events:none}
.kui-shade.on{opacity:1;pointer-events:auto}
.kui-panel{position:fixed;left:calc(10px + env(safe-area-inset-left,0px));top:calc(10px + env(safe-area-inset-top,0px));z-index:9600;
  width:min(340px,calc(100vw - 20px));max-height:calc(100vh - 20px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));overflow:auto;
  box-sizing:border-box;padding:10px 12px 12px;border-radius:16px;color:#f6ead2;background:rgba(16,13,10,.9);border:1px solid rgba(255,214,140,.35);
  box-shadow:0 12px 40px rgba(0,0,0,.55);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);font:15px/1.3 "Barlow Condensed",system-ui,-apple-system,sans-serif;
  transform-origin:top left;transform:scale(.96);opacity:0;visibility:hidden;transition:transform .16s,opacity .16s,visibility 0s .16s;overscroll-behavior:contain;
  -webkit-overflow-scrolling:touch;pointer-events:auto}
.kui-panel.on{transform:none;opacity:1;visibility:visible;transition:transform .16s,opacity .16s}
.kui-right .kui-chip,.kui-chip.kui-right{left:auto;right:calc(10px + env(safe-area-inset-right,0px))}
.kui-panel.kui-right{left:auto;right:calc(10px + env(safe-area-inset-right,0px));transform-origin:top right}
.kui-panel.kui-sheet{left:0;right:0;top:auto;bottom:0;width:auto;max-height:74vh;border-radius:18px 18px 0 0;transform:translateY(24px);transform-origin:bottom center;
  padding:6px 14px calc(14px + env(safe-area-inset-bottom,0px))}
.kui-panel.kui-sheet.on{transform:none}
.kui-sheet .kui-grab{display:block;width:40px;height:4px;border-radius:2px;background:rgba(255,255,255,.28);margin:2px auto 8px}
.kui-grab{display:none}
.kui-head{display:flex;align-items:center;gap:8px;margin:0 0 6px}
.kui-head b{flex:1;font-size:17px;letter-spacing:.04em;color:#ffe08a;font-weight:800}
.kui-head .kui-world{color:#cdbf9f;font-weight:600}
.kui-x{border:0;background:rgba(255,255,255,.08);color:#f6ead2;width:32px;height:32px;border-radius:50%;font-size:16px;cursor:pointer;flex:none}
.kui-sec{margin:8px 0 0}
.kui-sec[hidden]{display:none}
.kui-sec h4{margin:0 0 5px;font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:#bfa978;font-weight:700}
.kui-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.kui-panel button.kui-b,.kui-panel .kui-adopted button,.kui-panel button.kui-adopted{font:600 15px/1.1 "Barlow Condensed",system-ui,sans-serif!important;letter-spacing:.03em}
.kui-b{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:7px 12px;border-radius:10px;cursor:pointer;color:#f6ead2;
  background:rgba(255,255,255,.07);border:1px solid rgba(255,214,140,.25)}
.kui-b:hover{background:rgba(255,214,140,.14)}
.kui-b.kui-main{color:#1b1408;background:linear-gradient(#ffe08a,#f2b53c);border-color:#fff4d0}
.kui-b[aria-pressed="true"]{color:#1b1408;background:linear-gradient(#ffe08a,#f2b53c);border-color:#fff4d0}
.kui-adopted{position:static!important;inset:auto!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;
  transform:none!important;margin:0!important;z-index:auto!important;max-width:none!important;box-shadow:none!important;visibility:visible}
.kui-adopted[hidden],.kui-adopted.hidden{display:none!important}
.kui-panel .kui-adopted:is(button){min-height:36px;padding:7px 12px!important;border-radius:10px!important}
.kui-panel #langsw.kui-adopted,.kui-panel .kui-adopted.kui-flat{display:flex;flex-wrap:wrap;gap:6px;background:none!important;border:0!important;padding:0!important}
.kui-panel .kui-adopted.kui-text{display:block;background:none!important;border:0!important;padding:0!important;color:#d9ccb2;font-size:14px;white-space:normal;opacity:1!important;text-align:left!important;line-height:1.4!important}
.kui-panel #kolo-presence.kui-adopted{border-radius:12px!important;padding:8px 10px!important;background:rgba(255,255,255,.05)!important;width:100%;box-sizing:border-box;cursor:default}
.kui-panel #kolo-presence.kui-adopted .more{display:block}
.kui-cam{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.kui-cam input[type=range]{flex:1;min-width:120px;accent-color:#f2b53c}
.kui-note{color:#a99c80;font-size:13px;margin:5px 0 0}
.kui-toast{position:fixed;left:50%;top:calc(58px + env(safe-area-inset-top,0px));transform:translate(-50%,-6px);z-index:9550;max-width:min(440px,calc(100vw - 32px));
  padding:7px 14px;border-radius:12px;background:rgba(14,12,10,.72);border:1px solid rgba(255,214,140,.3);color:#f6ead2;text-align:center;
  font:600 14px/1.3 "Barlow Condensed",system-ui,sans-serif;opacity:0;transition:opacity .25s,transform .25s;pointer-events:none}
.kui-toast.on{opacity:1;transform:translate(-50%,0)}
.kui-go{position:fixed;inset:0;z-index:2147483000;overflow:hidden;opacity:0;transition:opacity .22s ease-out;pointer-events:auto;cursor:progress;
  font-family:"Barlow Condensed",system-ui,-apple-system,sans-serif;color:#fff}
.kui-go.on{opacity:1}
.kui-go canvas{position:absolute;inset:0;width:100%;height:100%}
.kui-go .kui-stage{position:absolute;left:0;right:0;bottom:15%;height:min(46vh,380px);display:flex;justify-content:center;align-items:flex-end;gap:min(2.2vw,22px)}
.kui-go .kui-av{position:relative;height:100%;aspect-ratio:200/360;transform:translateY(30px) scale(.94);opacity:0;
  transition:transform .55s cubic-bezier(.2,.8,.2,1),opacity .4s}
.kui-go .kui-av::before{content:"";position:absolute;inset:4% 6% 0;border-radius:50%;background:radial-gradient(closest-side,var(--g),transparent);opacity:.32}
.kui-go .kui-av img{width:100%;height:100%;object-fit:cover;mix-blend-mode:lighten;-webkit-mask-image:radial-gradient(48% 52% at 50% 47%,#000 62%,transparent 100%);
  mask-image:radial-gradient(48% 52% at 50% 47%,#000 62%,transparent 100%)}
.kui-go .kui-av::after{content:"";position:absolute;left:12%;right:12%;bottom:2%;height:8%;border-radius:50%;background:radial-gradient(closest-side,var(--g),transparent);opacity:.9;mix-blend-mode:screen}
.kui-go .kui-av.side{height:84%}
.kui-go.lift .kui-av{transform:none;opacity:1}
.kui-go .kui-title{position:absolute;left:0;right:0;top:15%;text-align:center;opacity:0;transform:translateY(8px);transition:opacity .4s .1s,transform .4s .1s}
.kui-go.lift .kui-title{opacity:1;transform:none}
.kui-go .kui-kick{font-weight:600;font-size:clamp(13px,2.2vw,18px);letter-spacing:.32em;text-transform:uppercase;opacity:.75}
.kui-go .kui-name{font-weight:800;font-size:clamp(34px,7vw,72px);letter-spacing:.04em;line-height:1;margin-top:6px;text-shadow:0 0 28px var(--a)}
.kui-go .kui-bar{position:absolute;left:30%;right:30%;bottom:8%;height:2px;border-radius:2px;background:rgba(255,255,255,.14);overflow:hidden}
.kui-go .kui-bar i{display:block;height:100%;width:0;background:var(--a);box-shadow:0 0 10px var(--a);transition:width 1.6s cubic-bezier(.3,.6,.2,1)}
.kui-go.lift .kui-bar i{width:85%}
@media (max-width:640px){.kui-go .kui-stage{bottom:17%;height:34vh;gap:0}.kui-go .kui-av{margin:0 -3.5vw}}
@media (prefers-reduced-motion:reduce){.kui-go .kui-av,.kui-go .kui-title,.kui-panel,.kui-panel.on,.kui-shade,.kui-toast{transition:none}}`;

  function addCss() {
    if (!D || D.getElementById("kui-css")) return;
    const st = D.createElement("style");
    st.id = "kui-css";
    // hideWhen: while the world shows its own dialog (an element inside the page, or a class on <body>) the button steps aside
    st.textContent = CSS + (S.hideWhen ? `\nbody:has(${S.hideWhen}) .kui-chip,body:is(${S.hideWhen}) .kui-chip{visibility:hidden}` : "");
    (D.head || D.documentElement).appendChild(st);
  }

  // taps and wheel on the menu stay in the menu: the world must not walk, turn or shoot from them
  function shield(el) {
    for (const ev of ["pointerdown", "mousedown", "touchstart", "touchmove", "click", "wheel", "contextmenu"]) {
      el.addEventListener(ev, (e) => { e.stopPropagation(); }, { passive: true });
    }
  }

  // ───────────── the menu ─────────────
  const SECTIONS = [
    ["me", "Account", "Аккаунт"],
    ["go", "Go to", "Перейти"],
    ["here", "Here", "Здесь"],
    ["camera", "Camera", "Камера"],
    ["online", "Who is where", "Кто где"],
    ["help", "Hints", "Подсказки"],
  ];
  const el = {};

  function build() {
    if (S.built || !D || !D.body) return;
    S.built = true;
    addCss();
    const chip = D.createElement("button");
    chip.type = "button";
    chip.className = "kui-chip";
    chip.id = "kui-chip";
    chip.innerHTML = '<span class="kui-burger" aria-hidden="true">☰</span><span class="kui-sum"></span>';
    chip.addEventListener("click", (e) => { e.preventDefault(); toggle(true); });
    shield(chip);
    const shade = D.createElement("div");
    shade.className = "kui-shade";
    shade.addEventListener("click", () => toggle(false));
    shield(shade);
    const panel = D.createElement("div");
    panel.className = "kui-panel";
    panel.id = "kui-panel";
    panel.setAttribute("role", "dialog");
    panel.innerHTML = '<span class="kui-grab"></span><div class="kui-head"><b>Maskaevcity <span class="kui-world"></span></b><button type="button" class="kui-x" aria-label="Close">✕</button></div>';
    panel.querySelector(".kui-x").addEventListener("click", () => toggle(false));
    for (const [id] of SECTIONS) {
      const s = D.createElement("section");
      s.className = "kui-sec";
      s.dataset.sec = id;
      s.innerHTML = '<h4></h4><div class="kui-row"></div>';
      s.hidden = true;
      panel.appendChild(s);
      el[id] = s;
    }
    shield(panel);
    if (S.corner === "right") { chip.classList.add("kui-right"); panel.classList.add("kui-right"); }
    D.body.append(shade, panel, chip);
    Object.assign(el, { chip, shade, panel });
    D.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && S.open) { e.stopPropagation(); toggle(false); }
    }, true);
    global.addEventListener("resize", layout);
    watchAdopted();
    render();
    layout();
  }

  function layout() {
    if (!el.panel) return;
    el.panel.classList.toggle("kui-sheet", !!phone() && global.innerWidth < 760);
  }

  function toggle(on) {
    if (!el.panel) return;
    S.open = on == null ? !S.open : !!on;
    if (S.open) {
      render();
      layout();
      try { if (D.pointerLockElement && D.exitPointerLock) D.exitPointerLock(); } catch (e) { /* not locked */ }
    }
    el.panel.classList.toggle("on", S.open);
    el.shade.classList.toggle("on", S.open);
    el.chip.dataset.open = S.open ? "1" : "0";
    global.dispatchEvent(new CustomEvent("kolo-ui:menu", { detail: { open: S.open } }));
  }

  // the line on the button: «Name · 3 in Maskaevcity» from the world's own account button, else just the name of the city
  function summary() {
    if (S.summary) { try { const own = S.summary(); if (own) return own; } catch (e) { /* the world's line failed: the default below */ } }
    const pill = D.getElementById("kolo-pill");
    const t = pill && !pill.hidden ? pill.textContent.replace(/\s+/g, " ").trim() : "";
    return t || "Maskaevcity";
  }

  function renderSummary() {
    if (!el.chip) return;
    const sum = summary();
    const s = el.chip.querySelector(".kui-sum");
    if (s.textContent !== sum) s.textContent = sum;
    el.chip.setAttribute("aria-label", L("Menu", "Меню") + " · " + sum);
    el.chip.title = L("Maskaevcity menu", "Меню Maskaevcity");
  }

  function render() {
    if (!el.panel) return;
    const w = WORLDS[S.world];
    el.panel.querySelector(".kui-world").textContent = w ? "· " + L(w.en, w.ru) : "";
    el.panel.querySelector(".kui-x").setAttribute("aria-label", L("Close", "Закрыть"));
    for (const [id, en, ru] of SECTIONS) el[id].querySelector("h4").textContent = L(en, ru);
    // own buttons (made by KoloUI.item)
    for (const it of S.items) {
      if (!it.btn) {
        it.btn = D.createElement("button");
        it.btn.type = "button";
        it.btn.className = "kui-b" + (it.main ? " kui-main" : "");
        it.btn.addEventListener("click", () => { if (it.close !== false) toggle(false); it.run(); });
        el[it.to].querySelector(".kui-row").appendChild(it.btn);
      }
      it.btn.textContent = (it.icon ? it.icon + " " : "") + L(it.en, it.ru);
      it.btn.hidden = !!(it.when && !it.when());
    }
    renderCamera();
    renderHelp();
    for (const [id] of SECTIONS) {
      const row = el[id].querySelector(".kui-row");
      el[id].hidden = ![...row.children].some(shown);
    }
    renderSummary();
  }

  // ───────────── adopting the world's own buttons ─────────────
  const shown = (c) => !c.hidden && !(c.classList && c.classList.contains("hidden"));
  function adoptOne(a) {
    const node = typeof a.sel === "string" ? D.querySelector(a.sel) : a.sel;
    if (!node || node.dataset.kuiAdopted) return false;
    node.dataset.kuiAdopted = a.to;
    node.classList.add("kui-adopted");
    if (a.kind) node.classList.add("kui-" + a.kind);
    if (a.close) node.addEventListener("click", () => setTimeout(() => toggle(false), 0));
    el[a.to].querySelector(".kui-row").appendChild(node);
    return true;
  }
  function watchAdopted() {
    const tick = () => {
      let moved = false;
      for (const a of S.adopt) if (adoptOne(a)) moved = true;
      if (moved) render();
      else renderSummary();
      // hidden state of adopted buttons may change: keep the sections honest
      for (const [id] of SECTIONS) {
        const row = el[id] && el[id].querySelector(".kui-row");
        if (row) el[id].hidden = ![...row.children].some(shown);
      }
    };
    tick();
    if (global.MutationObserver) {
      let queued = false;
      new MutationObserver(() => {
        if (queued) return;
        queued = true;
        setTimeout(() => { queued = false; tick(); }, 120);
      }).observe(D.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["hidden"] });
    } else setInterval(tick, 1000);
  }

  // ───────────── hints ─────────────
  function renderHelp() {
    const row = el.help && el.help.querySelector(".kui-row");
    if (!row) return;
    let n = row.querySelector(".kui-help-own");
    const txt = S.help ? L(S.help.en, S.help.ru) : "";
    const camTxt = S.cam ? L("Wheel or pinch: closer and further, all the way to first person. B: first / third person.",
      "Колесо мыши или щипок: ближе и дальше, до вида от первого лица. B: первое / третье лицо.") : "";
    const all = [txt, camTxt].filter(Boolean).join(" ");
    if (!all) { if (n) n.hidden = true; return; }
    if (!n) {
      n = D.createElement("p");
      n.className = "kui-help-own kui-note";
      n.style.margin = "0";
      row.prepend(n);
    }
    n.hidden = false;
    n.textContent = all;
  }

  let toastTimer = 0;
  function toast(text, ms) {
    if (!D || !D.body) return;
    addCss();
    let t = D.querySelector(".kui-toast");
    if (!t) { t = D.createElement("div"); t.className = "kui-toast"; t.setAttribute("role", "status"); D.body.appendChild(t); }
    t.textContent = text;
    requestAnimationFrame(() => t.classList.add("on"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("on"), ms || 4500);
  }

  // ───────────── camera ─────────────
  function camera(o) {
    o = o || {};
    const key = "kui.cam." + (S.world || "x");
    const c = {
      min: o.min || 1.6, max: o.max || 10, target: o.dist || 4, dist: o.dist || 4, first: !!o.first,
      third: o.dist || 4, canFirst: o.firstPerson !== false, canThird: o.thirdPerson !== false,
      blocked: o.blocked || (() => false), onChange: o.onChange || null, pinch: null,
    };
    try {
      const saved = JSON.parse(LS.get(key) || "null");
      if (saved && typeof saved.d === "number") { c.third = clamp(saved.d, c.min, c.max); c.target = c.third; c.first = !!saved.f; }
    } catch (e) { /* old value */ }
    if (!c.canFirst) c.first = false;
    if (!c.canThird) c.first = true;
    c.dist = c.first ? 0 : c.target;
    const save = () => LS.set(key, JSON.stringify({ d: +c.third.toFixed(2), f: c.first }));
    const changed = () => { save(); if (c.onChange) c.onChange(api.mode); render(); };

    const api = {
      get mode() { return c.first ? "first" : "third"; },
      get dist() { return c.dist; },
      get pinching() { return !!c.pinch; },
      set(mode) {
        const f = mode === "first";
        if ((f && !c.canFirst) || (!f && !c.canThird) || f === c.first) return;
        c.first = f;
        if (!f) c.target = c.third;
        changed();
      },
      toggle() { api.set(c.first ? "third" : "first"); },
      // k > 1 further, k < 1 closer; going closer than min ends in first person, going out of it starts at min
      zoom(k) {
        if (c.first) { if (k > 1.01 && c.canThird) { c.first = false; c.target = c.min; c.third = c.min; changed(); } return; }
        const t = c.target * k;
        if (t < c.min * 0.9 && c.canFirst) { c.first = true; changed(); return; }
        c.target = clamp(t, c.min, c.max);
        c.third = c.target;
        save();
        syncSlider();
      },
      setDist(d) { c.first = false; c.target = c.third = clamp(d, c.min, c.max); changed(); },
      // every frame: smooth, no jumps; fp is 1 in first person and fades to 0 just past the nearest third-person distance
      tick(dt) {
        const goal = c.first ? 0 : c.target;
        c.dist += (goal - c.dist) * (1 - Math.exp(-(dt || 0.016) * 9));
        if (Math.abs(goal - c.dist) < 0.002) c.dist = goal;
        return { dist: c.dist, fp: 1 - smooth(0.12, Math.max(0.5, c.min * 0.75), c.dist), mode: api.mode };
      },
      min: c.min, max: c.max,
    };

    const inUi = (t) => t && t.closest && t.closest(".kui-panel,.kui-chip,input,textarea,select,[data-kui-nowheel]");
    global.addEventListener("wheel", (e) => {
      if (inUi(e.target) || c.blocked() || e.ctrlKey) return;
      if (o.wheel && o.wheel(e) === false) return;
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;
      api.zoom(Math.exp(clamp(dy, -120, 120) * 0.0016));
    }, { passive: true });
    const gap = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    global.addEventListener("touchstart", (e) => {
      if (o.pinch === false || e.touches.length !== 2 || inUi(e.target) || c.blocked()) return;
      // a thumb walking on the left and a thumb looking on the right is not a pinch: both fingers must be on one side
      const [a, b] = e.touches, mid = global.innerWidth / 2;
      if ((a.clientX < mid) !== (b.clientX < mid)) return;
      c.pinch = { d: gap(e.touches) };
      KoloUI.pinching = true;
    }, { passive: true, capture: true });
    global.addEventListener("touchmove", (e) => {
      if (!c.pinch || e.touches.length !== 2) return;
      const d = gap(e.touches);
      if (Math.abs(d - c.pinch.d) < 6) return;
      api.zoom(Math.pow(c.pinch.d / d, 1.2));
      c.pinch.d = d;
    }, { passive: true, capture: true });
    const endPinch = (e) => { if (c.pinch && e.touches.length < 2) { c.pinch = null; setTimeout(() => { KoloUI.pinching = false; }, 60); } };
    global.addEventListener("touchend", endPinch, { passive: true, capture: true });
    global.addEventListener("touchcancel", endPinch, { passive: true, capture: true });
    if (o.key !== false) {
      global.addEventListener("keydown", (e) => {
        if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || c.blocked()) return;
        const t = e.target;
        if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
        if (e.code === (o.key || "KeyB") || (!e.code && /^[bи]$/i.test(e.key))) api.toggle();
      });
    }

    // the camera part of the menu
    const box = D.createElement("div");
    box.className = "kui-cam";
    box.innerHTML = '<button type="button" class="kui-b" data-m="first"></button><button type="button" class="kui-b" data-m="third"></button>' +
      '<input type="range" min="0" max="100" step="1" aria-label="zoom">';
    const range = box.querySelector("input");
    box.addEventListener("click", (e) => { const m = e.target && e.target.dataset && e.target.dataset.m; if (m) api.set(m); });
    range.addEventListener("input", () => { const k = +range.value / 100; api.setDist(c.min + (c.max - c.min) * k); });
    function syncSlider() { range.value = String(Math.round(((c.third - c.min) / (c.max - c.min || 1)) * 100)); range.disabled = c.first; }
    api._render = () => {
      const [f, t] = box.querySelectorAll("button");
      f.textContent = "👁 " + L("1st person", "1-е лицо");
      t.textContent = "🧍 " + L("3rd person", "3-е лицо");
      f.setAttribute("aria-pressed", String(c.first));
      t.setAttribute("aria-pressed", String(!c.first));
      f.hidden = !c.canFirst;
      t.hidden = !c.canThird;
      range.hidden = !c.canThird;
      syncSlider();
    };
    api._box = box;
    S.cam = api;
    KoloUI.cam = api;
    if (S.built) render();
    return api;
  }
  function renderCamera() {
    if (!S.cam || !el.camera) return;
    const row = el.camera.querySelector(".kui-row");
    if (S.cam._box.parentNode !== row) row.appendChild(S.cam._box);
    S.cam._render();
  }

  /** Camera place and the point it looks at. pivot = the eyes; yaw/pitch as in the worlds (camera behind at +sin(yaw), above at +pitch). */
  function orbit(p, yaw, pitch, dist, out) {
    const cp = Math.cos(pitch);
    const fx = -Math.sin(yaw) * cp, fy = -Math.sin(pitch), fz = -Math.cos(yaw) * cp; // where the eyes look
    out = out || {};
    out.x = p.x - fx * dist; out.y = p.y - fy * dist; out.z = p.z - fz * dist;
    out.lx = out.x + fx; out.ly = out.y + fy; out.lz = out.z + fz;
    return out;
  }

  // ───────────── the splash between worlds ─────────────
  let going = false;
  function splash(to, opt) {
    opt = opt || {};
    addCss();
    const w = WORLDS[to] || WORLDS.plaza;
    const box = D.createElement("div");
    box.className = "kui-go";
    box.style.setProperty("--a", w.a);
    const order = ["steel", "gold", "violet", "copper"];
    const glow = { gold: "#ffc95a", steel: "#6fe3d0", copper: "#ff9a4a", violet: "#b48cff" };
    const pics = typeof AVATARS === "object" ? AVATARS : {};
    const narrow = global.innerWidth < 520;
    box.innerHTML = '<canvas></canvas><div class="kui-title"><div class="kui-kick">Maskaevcity</div><div class="kui-name"></div></div>' +
      '<div class="kui-stage">' + order.map((id, i) => (pics[id] ? `<div class="kui-av${i === 0 || i === 3 ? " side" : ""}" style="--g:${glow[id]};transition-delay:${(narrow ? 0.05 : 0.08) * (i === 1 || i === 2 ? 0 : 1) + i * 0.04}s"><img alt="" src="${pics[id]}"></div>` : "")).join("") +
      '</div><div class="kui-bar"><i></i></div>';
    box.querySelector(".kui-name").textContent = opt.title || L(w.en, w.ru);
    D.body.appendChild(box);
    const cv = box.querySelector("canvas");
    const reduce = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stop = drawScene(cv, to, w, reduce);
    requestAnimationFrame(() => { box.classList.add("on"); requestAnimationFrame(() => box.classList.add("lift")); });
    return {
      el: box,
      done() { stop(); box.classList.remove("on"); setTimeout(() => box.remove(), 260); },
    };
  }

  // the background: the colours of the world you are going to, its outline far away, light from below and slow sparks
  function drawScene(cv, to, w, still) {
    const g = cv.getContext("2d");
    if (!g) return () => {};
    const dpr = Math.min(2, global.devicePixelRatio || 1);
    let W = 0, H = 0, raf = 0, alive = true;
    const size = () => { W = cv.clientWidth || global.innerWidth; H = cv.clientHeight || global.innerHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();
    const N = still ? 0 : (W < 640 ? 46 : 90);
    const sparks = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 2.2, v: 0.04 + Math.random() * 0.12, s: Math.random() * 6.28 }));
    const t0 = performance.now();
    const outline = OUTLINES[to] || OUTLINES.plaza;
    function frame(now) {
      if (!alive) return;
      const t = (now - t0) / 1000;
      const bg = g.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, w.c); bg.addColorStop(0.62, w.b); bg.addColorStop(1, w.c);
      g.globalCompositeOperation = "source-over";
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      outline(g, W, H, t, w);
      // a column of light where the four stand
      const beam = g.createRadialGradient(W / 2, H * 0.82, 10, W / 2, H * 0.62, Math.max(W, H) * 0.55);
      beam.addColorStop(0, hexA(w.a, 0.5)); beam.addColorStop(0.35, hexA(w.a, 0.14)); beam.addColorStop(1, hexA(w.a, 0));
      g.globalCompositeOperation = "lighter";
      g.fillStyle = beam; g.fillRect(0, 0, W, H);
      // rays turning slowly
      g.save(); g.translate(W / 2, H * 0.86); g.rotate(Math.sin(t * 0.4) * 0.05);
      for (let i = 0; i < 9; i++) {
        const a = -Math.PI / 2 + (i - 4) * 0.2;
        g.fillStyle = hexA(w.a, 0.035 + 0.02 * Math.sin(t * 2 + i));
        g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a - 0.04) * H * 1.3, Math.sin(a - 0.04) * H * 1.3); g.lineTo(Math.cos(a + 0.04) * H * 1.3, Math.sin(a + 0.04) * H * 1.3); g.closePath(); g.fill();
      }
      g.restore();
      for (const p of sparks) {
        const y = (p.y - t * p.v) % 1, yy = (y < 0 ? y + 1 : y) * H, xx = (p.x + Math.sin(t * 0.8 + p.s) * 0.012) * W;
        const k = 0.55 + 0.45 * Math.sin(t * 3 + p.s);
        g.fillStyle = hexA(w.a, 0.55 * k);
        g.beginPath(); g.arc(xx, yy, p.r, 0, 6.283); g.fill();
      }
      g.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    const onResize = () => size();
    global.addEventListener("resize", onResize);
    return () => { alive = false; cancelAnimationFrame(raf); global.removeEventListener("resize", onResize); };
  }
  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  // the outline of the place you are going to, drawn far away in the haze
  const OUTLINES = {
    doom(g, W, H, t, w) {
      const base = H * 0.78;
      g.fillStyle = "rgba(0,0,0,.55)";
      g.beginPath(); g.moveTo(0, base);
      const spires = [[0.08, 0.16], [0.16, 0.3], [0.24, 0.2], [0.33, 0.42], [0.4, 0.26], [0.5, 0.55], [0.6, 0.28], [0.67, 0.44], [0.76, 0.22], [0.84, 0.33], [0.93, 0.18]];
      for (const [x, h] of spires) { g.lineTo(W * (x - 0.03), base - H * h * 0.35); g.lineTo(W * x, base - H * h * 0.62); g.lineTo(W * (x + 0.03), base - H * h * 0.35); }
      g.lineTo(W, base); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
      const lava = g.createLinearGradient(0, base, 0, H);
      lava.addColorStop(0, hexA(w.a, 0.0)); lava.addColorStop(0.4, hexA(w.a, 0.35 + 0.08 * Math.sin(t * 3))); lava.addColorStop(1, hexA("#ffb02a", 0.5));
      g.fillStyle = lava; g.fillRect(0, base, W, H - base);
    },
    plaza(g, W, H, t, w) {
      const cx = W / 2, cy = H * 0.44, R = Math.min(W, H) * 0.26;
      g.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        g.strokeStyle = hexA(w.a, 0.22 - i * 0.05);
        g.beginPath(); g.ellipse(cx, cy, R * (1 - i * 0.12), R * Math.abs(Math.cos(t * 0.6 + i * 1.1)) * (1 - i * 0.12), i * 0.6, 0, 6.283); g.stroke();
      }
      g.strokeStyle = hexA(w.a, 0.12);
      g.beginPath(); g.arc(cx, cy, R * 0.55, 0, 6.283); g.stroke();
      g.fillStyle = "rgba(0,0,0,.35)";
      g.fillRect(0, H * 0.8, W, H * 0.2);
    },
    sfz(g, W, H, t, w) {
      const base = H * 0.8;
      let x = 0, i = 0;
      while (x < W) {
        const bw = 26 + ((i * 37) % 50), bh = H * (0.12 + ((i * 53) % 29) / 100);
        g.fillStyle = "rgba(4,8,20,.7)"; g.fillRect(x, base - bh, bw, bh);
        g.fillStyle = hexA(w.a, 0.5);
        for (let wy = base - bh + 8; wy < base - 6; wy += 9) for (let wx = x + 5; wx < x + bw - 5; wx += 8) if (((wx * 7 + wy * 13 + i) % 5) === 0) g.fillRect(wx, wy, 3, 4);
        x += bw + 2; i++;
      }
      g.fillStyle = "rgba(4,8,20,.8)"; g.fillRect(0, base, W, H - base);
    },
    app(g, W, H, t, w) {
      const pw = Math.min(W * 0.3, 190), ph = pw * 2, x = W / 2 - pw / 2, y = H * 0.18;
      g.strokeStyle = hexA(w.a, 0.25); g.lineWidth = 2;
      g.beginPath(); if (g.roundRect) g.roundRect(x, y, pw, ph, 26); else g.rect(x, y, pw, ph); g.stroke();
      for (let i = 0; i < 4; i++) {
        g.fillStyle = hexA(w.a, 0.12 + 0.05 * Math.sin(t * 2 + i));
        const bx = i % 2 ? x + pw * 0.3 : x + pw * 0.1, by = y + ph * (0.18 + i * 0.16);
        g.fillRect(bx, by, pw * 0.6, ph * 0.08);
      }
    },
  };

  /** Show the splash, then go. The page keeps it on screen until the next world draws itself. */
  function go(url, opt) {
    opt = opt || {};
    if (!url) return Promise.resolve(false);
    if (going) return Promise.resolve(false);
    going = true;
    if (S.open) toggle(false);
    let sp = null;
    try { sp = splash(opt.to || worldOf(url), opt); } catch (e) { sp = null; }
    const wait = opt.wait != null ? opt.wait : (sp ? 900 : 0);
    // back/forward cache: coming back must not find the old splash still on
    global.addEventListener("pageshow", (e) => { if (e.persisted && sp) { sp.done(); going = false; } }, { once: true });
    return new Promise((res) => setTimeout(() => {
      try { (opt.navigate || ((u) => global.location.assign(u)))(url); } catch (e) { global.location.href = url; }
      res(true);
    }, wait));
  }

  // arriving from another world: the same colours fade away into this one
  function arrive(world) {
    if (world) S.world = world;
    if (!D || !D.body) return;
    let from = "";
    try { from = D.referrer ? new URL(D.referrer).host : ""; } catch (e) { from = ""; }
    if (!from || from === global.location.host || !WORLDS[S.world]) return;
    addCss();
    const w = WORLDS[S.world];
    const box = D.createElement("div");
    box.className = "kui-go on";
    box.style.background = `radial-gradient(circle at 50% 70%, ${hexA(w.a, 0.35)}, ${w.c} 70%)`;
    box.style.pointerEvents = "none";
    box.style.transition = "opacity .7s ease-in";
    D.body.appendChild(box);
    setTimeout(() => { box.classList.remove("on"); setTimeout(() => box.remove(), 800); }, 120);
  }

  // ───────────── start ─────────────
  function init(o) {
    o = o || {};
    S.world = o.world || S.world;
    if (o.lang) S.lang = o.lang;
    if (o.help) S.help = o.help;
    if (o.hideWhen) S.hideWhen = o.hideWhen;
    if (o.corner) S.corner = o.corner;
    if (o.summary) S.summary = o.summary;
    for (const a of o.adopt || []) S.adopt.push(a);
    for (const it of o.items || []) S.items.push(it);
    const start = () => { build(); if (o.arrive !== false) arrive(); if (o.firstHint !== false) firstHint(); };
    if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
    return KoloUI;
  }
  function firstHint() {
    const k = "kui.hint." + S.world;
    if (LS.get(k)) return;
    LS.set(k, "1");
    setTimeout(() => toast(L("Everything is in the menu at the top left. Wheel or pinch moves the camera.", "Всё — в меню слева вверху. Колесо мыши или щипок двигают камеру."), 6000), 2500);
  }
  function item(it) {
    it.to = it.to || "here";
    S.items.push(it);
    if (S.built) render();
    return it;
  }

  const KoloUI = {
    version: VERSION,
    pinching: false,
    init, item, camera, orbit, go, splash, toast, worldOf,
    arrive: (world) => (D.readyState === "loading" ? D.addEventListener("DOMContentLoaded", () => arrive(world), { once: true }) : arrive(world)),
    open: () => toggle(true),
    close: () => toggle(false),
    isOpen: () => S.open,
    refresh: () => render(),
    adopt(a) { S.adopt.push(a); if (S.built && adoptOne(a)) render(); },
  };
  global.KoloUI = KoloUI;
})(typeof window !== "undefined" ? window : globalThis);
