// 28.10, through the internet: on https every part has its own name (Cloudflare tunnel, game2 scripts/tunnel/config.example.yml).
// A home address on that page (http://intro…:3000) is blocked from https and the tunnel has no such port, so the sign-in code
// never reached the core. Checked live on an https stand: the code now goes to https://core…, no request to a home address.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onThisMac, macUrls, DEFAULT_URLS } from '../src/urls.js';

test('on https a home port becomes that part\'s own name next to this page', () => {
  assert.equal(onThisMac('http://localhost:3000', 'intro.maskaevcity.com', 'https:'), 'https://core.maskaevcity.com');
  const u = macUrls(DEFAULT_URLS, 'doom-intro.maskaevcity.com', 'https:');
  assert.equal(u.coreUrl, 'https://core.maskaevcity.com');
  assert.equal(u.koloWorldUrl, 'https://plaza.maskaevcity.com/');
  assert.equal(u.doomUrl, 'https://doom.maskaevcity.com/');
  assert.equal(u.game1Url, 'https://play.maskaevcity.com/');
  assert.equal(u.introUrl, 'https://intro.maskaevcity.com/');
  if ('doomIntroUrl' in DEFAULT_URLS) assert.equal(u.doomIntroUrl, 'https://doom-intro.maskaevcity.com/');
});

test('an unknown home port on https is dropped, real addresses and Wi-Fi stay as before', () => {
  assert.equal(onThisMac('http://localhost:9999/', 'intro.maskaevcity.com', 'https:'), '');
  assert.equal(onThisMac('https://core.maskaevcity.com', 'intro.maskaevcity.com', 'https:'), 'https://core.maskaevcity.com');
  assert.equal(onThisMac('http://localhost:3000', 'macbook-air-ivan.local', 'http:'), 'http://macbook-air-ivan.local:3000');
});
