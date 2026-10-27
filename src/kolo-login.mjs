/**
 * Small shared login helper for Kolo games and the app (CORE_PLAN step 4).
 *
 * Phone login once on any origin → createHandoff() → open the other world with
 * ?handoff=<code> (60s, one-time) → consumeHandoff() stores a fresh session token
 * in that origin's storage.
 *
 * NEVER put the long-lived Bearer token in the URL (?token= is forbidden).
 * Cross-origin handoff is only ?handoff=<one-time-code>.
 *
 * Browser ESM. No build step. Copy this file or import from a static URL.
 *
 *   import { createLoginClient } from "./kolo-login.mjs";
 *   const kolo = createLoginClient({ coreUrl: "http://localhost:3000" });
 *
 * Services (contract 1.6.0): pass `service` ("start-from-zero" | "kolo-world" | "doom-world")
 * and the core gives this login only that game's rights — no chats, keys or votes.
 * Without `service` the login is the Kolo app with full access, as before 1.6.0.
 * A portal passes the TARGET service: linkWithHandoff(url, { service: "doom-world" }).
 *
 * Invites (contract 1.6.16): a personal link ?invite=<secret> is taken by takeHandoffFromUrl(),
 * removed from the address bar, kept in this origin's storage ("kolo.invite") and sent with start().
 * When the core runs invite-only, a closed number gets 403 {error:"registration_closed", message, messageRu}.
 *
 * Economy (contract 1.6.17+, kolo-hub plans/economy.md): wallet(), character(), doomEvents(),
 * catalog(), buy(), inventory(), equip(). The game never sends an amount: it reports events,
 * the core decides the pay. Every call answers { status, data } like the rest.
 */

/**
 * @param {{
 *   coreUrl: string,
 *   service?: string,
 *   storage?: Storage,
 *   storageKey?: string,
 *   fetch?: typeof fetch,
 * }} opts
 */
export function createLoginClient(opts) {
  const coreUrl = String(opts.coreUrl || "").replace(/\/$/, "");
  if (!coreUrl) throw new Error("kolo-login: coreUrl is required");
  const storage = opts.storage ?? (typeof localStorage !== "undefined" ? localStorage : null);
  const storageKey = opts.storageKey ?? "kolo.token";
  const inviteKey = "kolo.invite";
  const doFetch = opts.fetch ?? fetch;
  // Which service this client is (contract 1.6.0). Undefined = the Kolo app (full access).
  const service = opts.service || undefined;

  async function api(method, path, body, token) {
    const headers = {};
    if (body !== undefined) headers["content-type"] = "application/json";
    if (token) headers.authorization = `Bearer ${token}`;
    const res = await doFetch(coreUrl + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { status: res.status, data };
  }

  function getToken() {
    if (!storage) return null;
    try {
      const t = storage.getItem(storageKey);
      return t && t.length ? t : null;
    } catch {
      return null;
    }
  }

  function setToken(token) {
    if (!storage) return;
    try {
      if (token) storage.setItem(storageKey, token);
      else storage.removeItem(storageKey);
    } catch {
      /* private mode / quota */
    }
  }

  function clearToken() {
    setToken(null);
  }

  function getInvite() {
    try {
      return (storage && storage.getItem(inviteKey)) || null;
    } catch {
      return null;
    }
  }

  function setInvite(secret) {
    if (!storage) return;
    try {
      storage.setItem(inviteKey, secret);
    } catch {
      /* private mode / quota */
    }
  }

  /** Drop legacy ?token= (and friends) from a URLSearchParams — never accept token from the query. */
  function stripUnsafeAuthParams(params) {
    const removed = [];
    for (const key of ["token", "access_token", "bearer", "auth"]) {
      if (params.has(key)) {
        params.delete(key);
        removed.push(key);
      }
    }
    return removed;
  }

  function replaceUrlSearch(params) {
    if (typeof history === "undefined" || typeof location === "undefined") return;
    const q = params.toString();
    const next = location.pathname + (q ? `?${q}` : "") + location.hash;
    history.replaceState(null, "", next);
  }

  function authed(method, path, body) {
    const token = getToken();
    if (!token) return Promise.resolve({ status: 401, data: { error: "not logged in" } });
    return api(method, path, body, token);
  }
  const worldQuery = (world) => (world ? `?world=${encodeURIComponent(world)}` : "");

  return {
    coreUrl,
    service,
    getToken,
    setToken,
    clearToken,

    /** POST /auth/start (sends the invite from the personal link, if this device has one — 1.6.16) */
    async start(phone, { autoConfirm = false, invite } = {}) {
      const body = { phone };
      if (autoConfirm) body.autoConfirm = true;
      if (service) body.service = service;
      const secret = invite || getInvite();
      if (secret) body.invite = secret;
      const r = await api("POST", "/auth/start", body);
      if (r.status < 300 && r.data?.token) setToken(r.data.token);
      return r;
    },

    /** POST /auth/verify → stores token */
    async verify(phone, code) {
      const body = { phone, code };
      if (service) body.service = service;
      const r = await api("POST", "/auth/verify", body);
      if (r.status < 300 && r.data?.token) setToken(r.data.token);
      return r;
    },

    /** POST /auth/logout with current token */
    async logout() {
      const token = getToken();
      const r = token ? await api("POST", "/auth/logout", {}, token) : { status: 401, data: { error: "not logged in" } };
      clearToken();
      return r;
    },

    /** GET /me */
    async me() {
      const token = getToken();
      if (!token) return { status: 401, data: { error: "not logged in" } };
      return api("GET", "/me", undefined, token);
    },

    /** GET /me/wallet → { currency: "kolo", balance } */
    wallet() {
      return authed("GET", "/me/wallet");
    },

    /** GET /me/wallet/history → { entries: [{ amount, balanceAfter, reason, at, ... }] }, newest first */
    walletHistory({ before, limit } = {}) {
      const q = new URLSearchParams();
      if (before) q.set("before", new Date(before).toISOString());
      if (limit) q.set("limit", String(limit));
      return authed("GET", `/me/wallet/history${q.size ? `?${q}` : ""}`);
    },

    /** GET /me/character → { level, xp, nextLevelXp, unlocks: { "doom.pvp": { level, open } } } — never lost */
    character() {
      return authed("GET", "/me/character");
    },

    /**
     * POST /me/game/doom/events — what happened in Doom, up to 50 at a time; the core decides the pay.
     * Each event needs a unique id; sending the same id again pays nothing (safe to queue and retry).
     * @param {Array<{type:"kill", id:string, kind:string, boss?:boolean} | {type:"mission_clear", id:string, levelId:string, rating:"S"|"A"|"B"|"C"}>} events
     */
    doomEvents(events) {
      return authed("POST", "/me/game/doom/events", { events });
    },

    /** GET /shop/catalog?world= → { balance, level, items: [{ id, price, minLevel, stats, canBuy, why }] } */
    catalog(world) {
      return authed("GET", `/shop/catalog${worldQuery(world)}`);
    },

    /** POST /shop/buy — clientEventId unique per click: a double click buys once */
    buy(itemId, clientEventId) {
      return authed("POST", "/shop/buy", { itemId, clientEventId });
    },

    /** GET /me/inventory?world= → { items: [{ id, source, usableHere, equippedIn }], equipment, doomGear } */
    inventory(world) {
      return authed("GET", `/me/inventory${worldQuery(world)}`);
    },

    /** PUT /me/equipment — put on (itemId) or take off (null) armor "body" / helmet "head" in this world */
    equip(world, slot, itemId) {
      return authed("PUT", "/me/equipment", { world, slot, itemId });
    },

    /**
     * POST /auth/handoff — one-time code (≈60s) for another origin.
     * @param {string} [targetService] the service that will consume the code (1.6.0); default = same as this login
     * @returns {{ status: number, data: { code?: string, expiresIn?: number, error?: unknown } }}
     */
    async createHandoff(targetService) {
      const token = getToken();
      if (!token) return { status: 401, data: { error: "not logged in" } };
      return api("POST", "/auth/handoff", targetService ? { service: targetService } : {}, token);
    },

    /**
     * POST /auth/handoff/consume — exchange code for a session on this origin.
     * Stores the new token on success.
     */
    async consumeHandoff(code) {
      const r = await api("POST", "/auth/handoff/consume", { code });
      if (r.status < 300 && r.data?.token) setToken(r.data.token);
      return r;
    },

    /** True when this device holds a personal invite (it opened ?invite=…). */
    hasInvite() {
      return !!getInvite();
    },

    /**
     * Carry the personal invite to the page that asks for the phone (another origin keeps its own storage).
     * Adds ?invite=… only while this device holds an invite and is not signed in yet; otherwise returns url as is.
     */
    withInvite(url) {
      const secret = getInvite();
      if (!secret || getToken()) return url;
      try {
        const u = new URL(url, typeof location !== "undefined" ? location.href : undefined);
        u.searchParams.set("invite", secret);
        return u.href;
      } catch {
        return url;
      }
    },

    /**
     * Boot helper: consume ?handoff=… if present; always strip unsafe ?token= from the URL.
     * Never reads or stores a token from the query string.
     * @returns {{ handoff: object|null, strippedTokenParams: string[] }}
     */
    async takeHandoffFromUrl(search = typeof location !== "undefined" ? location.search : "") {
      const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
      const strippedTokenParams = stripUnsafeAuthParams(params);
      // A personal invite link (1.6.16): keep the secret for start(), never leave it in the address bar
      const invite = params.get("invite");
      if (invite) {
        setInvite(invite);
        params.delete("invite");
      }
      const code = params.get("handoff");
      let handoff = null;
      if (code) {
        handoff = await this.consumeHandoff(code);
        params.delete("handoff");
      }
      if (code || invite || strippedTokenParams.length) replaceUrlSearch(params);
      return { handoff, strippedTokenParams, invite: !!invite };
    },

    /**
     * Build a URL to another world/app with a fresh handoff code.
     * Strips any ?token= on the target — only ?handoff= is set.
     * @param {string} targetUrl absolute or path URL of the destination
     * @param {{ service?: string }} [opts] the destination's service (1.6.0), e.g. "doom-world"
     */
    async linkWithHandoff(targetUrl, { service: targetService } = {}) {
      const issued = await this.createHandoff(targetService);
      if (issued.status >= 300 || !issued.data?.code) return issued;
      const u = new URL(targetUrl, typeof location !== "undefined" ? location.href : "http://localhost/");
      stripUnsafeAuthParams(u.searchParams);
      u.searchParams.set("handoff", issued.data.code);
      return {
        status: 200,
        data: { url: u.toString(), expiresIn: issued.data.expiresIn, code: issued.data.code },
      };
    },
  };
}

export default createLoginClient;
