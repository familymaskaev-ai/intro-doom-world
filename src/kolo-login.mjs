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
 */

/**
 * @param {{
 *   coreUrl: string,
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
  const doFetch = opts.fetch ?? fetch;

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

  return {
    coreUrl,
    getToken,
    setToken,
    clearToken,

    /** POST /auth/start */
    async start(phone, { autoConfirm = false } = {}) {
      const body = { phone };
      if (autoConfirm) body.autoConfirm = true;
      const r = await api("POST", "/auth/start", body);
      if (r.status < 300 && r.data?.token) setToken(r.data.token);
      return r;
    },

    /** POST /auth/verify → stores token */
    async verify(phone, code) {
      const r = await api("POST", "/auth/verify", { phone, code });
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

    /**
     * POST /auth/handoff — one-time code (≈60s) for another origin.
     * @returns {{ status: number, data: { code?: string, expiresIn?: number, error?: unknown } }}
     */
    async createHandoff() {
      const token = getToken();
      if (!token) return { status: 401, data: { error: "not logged in" } };
      return api("POST", "/auth/handoff", {}, token);
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

    /**
     * Boot helper: consume ?handoff=… if present; always strip unsafe ?token= from the URL.
     * Never reads or stores a token from the query string.
     * @returns {{ handoff: object|null, strippedTokenParams: string[] }}
     */
    async takeHandoffFromUrl(search = typeof location !== "undefined" ? location.search : "") {
      const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
      const strippedTokenParams = stripUnsafeAuthParams(params);
      const code = params.get("handoff");
      let handoff = null;
      if (code) {
        handoff = await this.consumeHandoff(code);
        params.delete("handoff");
      }
      if (code || strippedTokenParams.length) replaceUrlSearch(params);
      return { handoff, strippedTokenParams };
    },

    /**
     * Build a URL to another world/app with a fresh handoff code.
     * Strips any ?token= on the target — only ?handoff= is set.
     * @param {string} targetUrl absolute or path URL of the destination
     */
    async linkWithHandoff(targetUrl) {
      const issued = await this.createHandoff();
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
