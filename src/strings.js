/**
 * Copy taken from game3-doom-world @ c045dc3 (js/i18n.js: greet*, title, tagline, hint, skip).
 * Ivan will refine later — do not invent new plot beats.
 */

import { L } from './i18n.js';

/** @typedef {'first' | 'return'} VisitMode */

/**
 * Static chrome + beat list for paced first visit (~1.5–2 min) / short return.
 * Beats only reorder/reuse game3 strings (dwell comes from pace.js).
 * @param {'en'|'ru'} lang
 * @param {VisitMode} mode
 */
export function stringsFor(lang, mode) {
  const t = (en, ru) => L(lang, en, ru);
  const first = mode !== 'return';

  const greetFirstTitle = t('Welcome, tester', 'Добро пожаловать, тестер');
  const greetFirst = t(
    'Short briefing: ten lives, original foes, weapons from your Kolo account. Skip when ready.',
    'Коротко: десять жизней, свои враги, оружие с аккаунта Коло. Пропустите, когда готовы.'
  );
  const doomTitle = t('Doom World', 'Мир Doom');
  const tagline = t(
    'One arena under the plaza — walk the halls, clear the creatures, come back alive.',
    'Одна арена под площадью — пройдите залы, зачистите тварей, вернитесь живыми.'
  );
  const hint = t(
    'WASD — move · mouse — look · click / Space — shoot · 1–0 / scroll — weapon · P — special-save · Esc — release mouse',
    'WASD — ходьба · мышь — взгляд · клик / пробел — выстрел · 1–0 / колёсико — оружие · P — special-save · Esc — отпустить мышь'
  );
  const greetReturnTitle = t('Back again', 'Снова здесь');
  const greetReturn = t(
    'Welcome back. Same arena, your lives and XP wait on the account. Skip to play.',
    'С возвращением. Та же арена — жизни и XP на аккаунте. Пропустите, чтобы играть.'
  );
  const skipLabel = t('Skip', 'Пропустить');

  const beats = first
    ? [
      { title: greetFirstTitle, line: greetFirst, thought: tagline },
      { title: doomTitle, line: tagline, thought: greetFirst },
      { title: doomTitle, line: hint, thought: greetFirst },
      { title: greetFirstTitle, line: greetFirst, thought: skipLabel },
    ]
    : [
      { title: greetReturnTitle, line: greetReturn, thought: '' },
    ];

  const head = beats[0];

  return {
    brand: doomTitle,
    brandSub: t('doom-world', 'doom-world'),
    who: greetFirstTitle,
    title: head.title,
    sub: t('doom-world', 'doom-world'),
    line: head.line,
    thought: head.thought,
    beats,
    continue: first ? t('Enter', 'Войти') : t('Continue', 'Дальше'),
    skip: skipLabel,
    skipAria: t('Skip intro', 'Пропустить вступление'),
    skipping: t('Skipping…', 'Пропускаем…'),
    doneNoNext: t(
      'Intro finished. Set ?next= to the game3 doom-world URL.',
      'Интро закончено. Укажите ?next= — адрес арены (game3).'
    ),
  };
}

/** Return greeting is real copy from game3 — not a placeholder. */
export const RETURN_GREETING_SLOT = Object.freeze({
  id: 'return-greeting',
  status: 'ready',
  en: 'Welcome back. Same arena, your lives and XP wait on the account. Skip to play.',
  ru: 'С возвращением. Та же арена — жизни и XP на аккаунте. Пропустите, чтобы играть.',
});
