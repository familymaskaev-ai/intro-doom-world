# intro-doom-world — интро арены Doom

Короткое пропускаемое вступление перед [game3-doom-world](https://github.com/familymaskaev-ai/game3-doom-world).

- Поток: **вход → это интро → арена** (как game1 → intro-kolo → площадь).
- **Первый визит ~1.5–2 минуты**, повторный — короткая карточка; **Skip всегда**.
- Язык страницы целиком `ru` \| `en`.
- Тексты перенесены из game3 (`from-game3/`), без новых сюжетных реплик.
- Не путать с [intro-start-from-zero](https://github.com/familymaskaev-ai/intro-start-from-zero) (фильм SFZ) и [intro-kolo-world](https://github.com/familymaskaev-ai/intro-kolo-world) (Жульен).

## Запуск

```bash
npm start
# http://localhost:4174/?lang=ru
# без ?next= → urls.doomUrl (:8090)
```

## Проверки

```bash
npm test
```

## Мост к game3

См. [`docs/BRIDGE.md`](docs/BRIDGE.md). Состояние: [`STATUS.md`](STATUS.md).

Правила проекта: [PROJECT.md в kolo-hub](https://github.com/familymaskaev-ai/kolo-hub/blob/main/PROJECT.md).
