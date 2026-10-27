# STATUS — intro-doom-world

- **Версия:** 0.1.1 (introBridge 1)
- **Дата:** 22.10.2026
- **Длина:** first 1.5–2 мин (`90–120` с, цель `105` с); return ~12 с; Skip всегда

## Сделано

- **П1 (27.10): одна копия kolo-login.** Файлы `kolo-login.*` — точная копия из kolo-core (`scripts/kolo-login-sync.mjs --all`), отпечатки в `kolo-login.sha256`, тест сверяет их. Руками не править.
- Пропускаемое интро перед ареной Doom (паттерн intro-kolo-world).
- Тексты first/return из game3 `@ c045dc3` → `src/strings.js` + `from-game3/*.copy`.
- Язык `ru` \| `en`; urls локальные (`doomIntroUrl` `:4174`, `doomUrl` `:8090`).
- Мост: `docs/BRIDGE.md`, query `next` / `intro` / `introBridge`.
- Auth handoff: `src/kolo-login.mjs` — consume `?handoff=` on start; `linkWithHandoff` on finish → arena. **No `?token=`**.
- Тесты: `npm test` (+ `test/auth-handoff.test.mjs`).

## Сломано

- Нет.

## Ждёт от Ивана

1. Продакшн-URL в `urls` когда будут хосты.

## Ссылки

- Репо: https://github.com/familymaskaev-ai/intro-doom-world
- Auth handoff PR: draft → green CI → merge
- Почему отдельный репо: `internal/intro-doom-why.md` + `intro-doom-why-env.md`
