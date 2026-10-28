# STATUS — intro-doom-world

- **Через интернет (28.10).** На https у каждой части своё имя (туннель Cloudflare). Домашний адрес в странице (`http://intro…:3000`) с https не открывается, и код входа не доходил до ядра. Теперь на https домашний порт превращается в имя части рядом с этой страницей (3000→core, 8080→plaza, 8090→doom, 8123→play, 4173→intro, 4174→doom-intro), `src/urls.js`. Проверено на стенде «как через интернет»: код входа уходит на https://core…, ни одного запроса на домашние адреса. Тест `test/internet-urls.test.mjs`.
- **Версия:** 0.1.1 (introBridge 1)
- **Дата:** 22.10.2026
- **Длина:** first 1.5–2 мин (`90–120` с, цель `105` с); return ~12 с; Skip всегда

## Сделано
- **CI экономнее (28.10, решение Ивана 11:50).** Минуты GitHub Actions на октябрь кончились. Проверки идут только на PR в main и только когда меняется код, тесты или docs; старый прогон того же PR отменяется; ручной запуск с вкладки Actions (`workflow_dispatch`). На main после мержа — только короткая проверка «пришло через PR». Пока минут нет: перед мержем `bash scripts/check-secrets.sh` и `npm test` локально, результат в описании PR.
- **Р10 (27.10): интро говорит Maskaevcity** (Поправка 1, kolo-hub `docs/architecture/AMENDMENTS.md`). Слова Жульена, вкладка, вывеска, README. Длина интро и порядок сцен не менялись. Технические имена (`kolo.lang`, `kolo.token`, `kolo-world`) не тронуты. Тест `test/visible-names.test.mjs`.
- **П11.4 (27.10): с телефона интро ведёт на Мак.** Интро, открытое по имени Мака (`….local` или цифры), меняет адреса `localhost` на это имя, порт тот же (`onThisMac` в `src/urls.js`, тест `test/lan-urls.test.mjs`). Вход через ядро и переход дальше с телефона идут на Мак.
- **П13 (27.10): кнопка «Пропустить» снова работает.** При запуске интро писало `data-*` в `document` вместо `<html>` и падало («Cannot set properties of undefined (setting 'visit')»), поэтому ни «Пропустить», ни автопереход дальше не срабатывали — игрок застревал в интро. Нашёл сквозной тест пути в браузере (game2 `npm run e2e`). Тест `test/apply-beat.test.mjs`.

- **П12 (27.10): одинаковый CI.** Шаг «Secret scan» (`scripts/check-secrets.sh`, копия из game2), Node из `.nvmrc` (22), проверка «в main только через PR» (как в kolo-core), тест: ключи и порты блока `urls` совпадают с таблицей kolo-hub `docs/URLS.md`.
- **П11 (27.10): запуск без интернета.** `npm start` → `node scripts/serve.mjs . 4174` (копия game2 `scripts/static-serve.mjs`), вместо `npx --yes serve`, который каждый раз скачивал пакет. game2 `run-mac.sh` поднимает это интро на :4174 сам.
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
