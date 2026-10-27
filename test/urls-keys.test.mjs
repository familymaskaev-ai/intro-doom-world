// П12 (infra plan step 8): the keys of the "urls" block are the ones in the single address table,
// kolo-hub docs/URLS.md (https://github.com/familymaskaev-ai/kolo-hub/blob/main/docs/URLS.md).
// A new address key goes into that table first, then here.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TABLE = ["coreUrl", "introUrl", "doomIntroUrl", "koloWorldUrl", "doomUrl", "game1Url", "koloApp"];
const PORTS = { coreUrl: 3000, introUrl: 4173, doomIntroUrl: 4174, koloWorldUrl: 8080, doomUrl: 8090, game1Url: 8123 };

test("urls keys and local ports match kolo-hub docs/URLS.md", () => {
  const html = readFileSync(join(ROOT, "index.html"), "utf8");
  const block = html.match(/<script id="intro-config" type="application\/json">([\s\S]*?)<\/script>/);
  assert.ok(block, "#intro-config is in index.html");
  const urls = JSON.parse(block[1]).urls;
  assert.ok(urls && typeof urls === "object", "#intro-config has urls");
  for (const key of Object.keys(urls)) assert.ok(TABLE.includes(key), `${key} is not in docs/URLS.md`);
  for (const [key, port] of Object.entries(PORTS)) {
    if (!urls[key]) continue; // empty = ask the core
    assert.equal(new URL(urls[key]).port, String(port), `${key} port`);
  }
});
