/**
 * Intro length standard for KOLO world intros (not the 6‑minute SFZ film).
 * First visit: 1.5–2 minutes. Return: short card. Skip always available.
 */

export const INTRO_PACE = Object.freeze({
  /** Inclusive lower bound for a full first-visit run (ms). */
  firstMinMs: 90_000,
  /** Inclusive upper bound — never a long film. */
  firstMaxMs: 120_000,
  /** Default auto-complete target for first visit (mid of band). */
  firstTargetMs: 105_000,
  /** Short return greeting. */
  returnMs: 12_000,
});

/**
 * Dwell times for first-visit beats. Sum must sit inside [firstMinMs, firstMaxMs].
 * Content lines come from game3 @ c045dc3 — no invented plot.
 */
export const FIRST_BEAT_MS = Object.freeze([28_000, 28_000, 28_000, 21_000]);

/** @param {readonly number[]} beats */
export function sumBeats(beats) {
  return beats.reduce((a, b) => a + b, 0);
}

/** Assert pace constants stay on the product standard. */
export function assertPaceStandard(pace = INTRO_PACE, firstBeats = FIRST_BEAT_MS) {
  const sum = sumBeats(firstBeats);
  if (pace.firstMinMs < 90_000 || pace.firstMaxMs > 120_000) {
    throw new Error('first visit band must be within 90–120s');
  }
  if (pace.firstTargetMs < pace.firstMinMs || pace.firstTargetMs > pace.firstMaxMs) {
    throw new Error('firstTargetMs outside band');
  }
  if (sum < pace.firstMinMs || sum > pace.firstMaxMs) {
    throw new Error(`first beats sum ${sum}ms outside ${pace.firstMinMs}–${pace.firstMaxMs}`);
  }
  if (pace.returnMs < 5_000 || pace.returnMs > 30_000) {
    throw new Error('return greeting must stay short (5–30s)');
  }
  return { sum, ...pace };
}

/**
 * Build scheduled beat offsets for a visit mode.
 * @param {'first'|'return'} mode
 */
export function scheduleFor(mode, pace = INTRO_PACE, firstBeats = FIRST_BEAT_MS) {
  if (mode === 'return') {
    return Object.freeze([{ index: 0, atMs: 0, dwellMs: pace.returnMs }]);
  }
  let t = 0;
  const out = firstBeats.map((dwellMs, index) => {
    const row = { index, atMs: t, dwellMs };
    t += dwellMs;
    return row;
  });
  return Object.freeze(out);
}
