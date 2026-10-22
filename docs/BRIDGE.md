# Мост: intro-doom-world → game3-doom-world

Интро показывается **перед ареной Doom** при каждом входе:

1. с портала Площади Нуля — `from=kolo-world`
2. прямой URL / тестер — `from=other`
3. при необходимости — `from=game1` \| `from=app`

После интро (или пропуска) открывается **game3-doom-world** (арена).

Тот же паттерн, что intro-kolo-world → game2. Правила: [PROJECT.md](https://github.com/familymaskaev-ai/kolo-hub/blob/main/PROJECT.md).

## Длина

| Режим | Длительность | Skip |
| --- | --- | --- |
| `visit=first` | **1.5–2 мин** (pace `90–120` с, цель `105` с) | всегда |
| `visit=return` | коротко (~12 с) | всегда |

Не фильм на 6 минут (intro-start-from-zero / SFZ film не трогаем).

## Версия моста

`introBridge=1` (`INTRO_BRIDGE` в `src/bridge.js`, также `window.DoomIntro.bridge`).

## Единый блок URL (`#intro-config`)

```json
"urls": {
  "coreUrl": "http://localhost:3000",
  "introUrl": "http://localhost:4173/",
  "doomIntroUrl": "http://localhost:4174/",
  "koloWorldUrl": "http://localhost:8080/",
  "doomUrl": "http://localhost:8090/",
  "game1Url": "http://localhost:8123/",
  "koloApp": { "url": "", "installUrl": "" }
}
```

Без `?next=` интро берёт `urls.doomUrl` (локальная арена `:8090`).

## URL интро

```
http://localhost:4174/?lang=ru&from=kolo-world&visit=first&next=http%3A%2F%2Flocalhost%3A8090%2F
```

| Параметр | Обязателен | Смысл |
|---|---|---|
| `lang` | нет | `ru` \| `en` |
| `next` | нет* | URL арены (game3). *Без query — из `urls.doomUrl` |
| `from` | нет | `kolo-world` \| `game1` \| `app` \| `other` |
| `visit` | нет | `first` \| `return`. Иначе счётчик `doom.intro.visits` |
| `account` | нет | непрозрачный id; пробрасывается в `next` |

## Что интро отдаёт в game3

| Поле | Значение |
|---|---|
| `lang` | `ru` \| `en` |
| `from` | как во входе |
| `intro` | `done` \| `skipped` |
| `introBridge` | `1` |
| `account` | если был |

game3 без `intro=done|skipped` редиректит на `urls.doomIntroUrl` (`?skipIntro` — обход).

## API страницы

```js
window.DoomIntro = {
  version, bridge, pace,
  start(opts), skip(), complete(), getState(),
  RETURN_GREETING_SLOT
}
```

## Тексты

Канон: `src/strings.js` (из game3 `@ c045dc3`). Справка: `from-game3/*.copy`.
