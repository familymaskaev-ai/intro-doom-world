// П11.4: a phone on the home Wi-Fi opens the intro by the Mac's name; the way on must lead to the Mac, not to the phone itself.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onThisMac, macUrls, DEFAULT_URLS } from '../src/urls.js';

test('on the Mac itself localhost stays localhost', () => {
  assert.equal(onThisMac('http://localhost:8080/', 'localhost'), 'http://localhost:8080/');
});

test('on a phone localhost becomes the Mac name, the port stays', () => {
  assert.equal(onThisMac('http://localhost:3000', 'macbook-air-ivan.local'), 'http://macbook-air-ivan.local:3000');
  const u = macUrls(DEFAULT_URLS, '192.168.1.20');
  assert.equal(u.coreUrl, 'http://192.168.1.20:3000');
  assert.equal(u.koloWorldUrl, 'http://192.168.1.20:8080/');
  assert.equal(u.doomUrl, 'http://192.168.1.20:8090/');
});

test('real and empty addresses are left alone', () => {
  assert.equal(onThisMac('https://kolo.example/', '192.168.1.20'), 'https://kolo.example/');
  assert.equal(onThisMac('', '192.168.1.20'), '');
});
