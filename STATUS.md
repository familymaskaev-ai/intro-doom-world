# STATUS — intro-doom-world

- **Версия:** 0.1.0 (introBridge 1)
- **Дата:** 22.10.2026
- **Длина:** first 1.5–2 мин (`90–120` с, цель `105` с); return ~12 с; Skip всегда

## Сделано

- Пропускаемое интро перед ареной Doom (паттерн intro-kolo-world).
- Тексты first/return из game3 `@ c045dc3` → `src/strings.js` + `from-game3/*.copy`.
- Язык `ru` \| `en`; urls локальные (`doomIntroUrl` `:4174`, `doomUrl` `:8090`).
- Мост: `docs/BRIDGE.md`, query `next` / `intro` / `introBridge`.
- Тесты: `npm test`.

## Сломано

- Нет.

## Ждёт от Ивана

1. Review draft PR → merge в `main` (агент сам не мержит).
2. Продакшн-URL в `urls` когда будут хосты.

## Ссылки

- Репо: https://github.com/familymaskaev-ai/intro-doom-world (`main` + README; каркас в draft PR)
- Ветка: `cursor/intro-doom-scaffold-b309`
- Bundle: store `artifacts/intro-doom-world.bundle`
- game3 handoff: https://github.com/familymaskaev-ai/game3-doom-world/pull/4
- Почему отдельный репо: `internal/intro-doom-why.md` + `intro-doom-why-env.md`
