/**
 * Vouch Score engine (PRD §16).
 *
 * The score is a concept demonstration of CONTEXTUAL rider behaviour — it is
 * explicitly NOT an insurance, legal, credit, or official safety score.
 *
 * A base score plus a transparent, human-readable breakdown of factors. Each
 * analysed manoeuvre nudges the relevant factor: a context-justified manoeuvre
 * rewards "context-aware riding"; an unexplained one deepens the
 * "unexplained manoeuvres" penalty.
 */
import type { ContextResult, ScoreFactor, ScoreFactorKey } from "@/types";
import { isJustified } from "./contextEngine";

export const BASE_SCORE = 74;
export const MAX_SCORE = 100;
export const MIN_SCORE = 0;

/**
 * Default breakdown. Sums to +13 over the base of 74 → 87, matching the PRD
 * dashboard figure (§9, §16).
 */
export const DEFAULT_FACTORS: ScoreFactor[] = [
  { key: "context_aware", label: "Context-aware riding", delta: 8 },
  { key: "smooth_acceleration", label: "Smooth acceleration", delta: 4 },
  { key: "safe_braking", label: "Safe braking", delta: 3 },
  { key: "unexplained_manoeuvres", label: "Unexplained manoeuvres", delta: -2 },
];

/** Per-factor bounds so repeated demo runs can't send the score out of range. */
const FACTOR_BOUNDS: Record<ScoreFactorKey, { min: number; max: number }> = {
  context_aware: { min: 0, max: 14 },
  smooth_acceleration: { min: 0, max: 8 },
  safe_braking: { min: 0, max: 6 },
  unexplained_manoeuvres: { min: -10, max: 0 },
};

function clampScore(value: number): number {
  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, Math.round(value)));
}

/** Total score = base + sum of factor deltas, clamped to 0..100. */
export function computeScore(factors: ScoreFactor[]): number {
  const sum = factors.reduce((acc, f) => acc + f.delta, 0);
  return clampScore(BASE_SCORE + sum);
}

function adjustFactor(
  factors: ScoreFactor[],
  key: ScoreFactorKey,
  by: number,
): ScoreFactor[] {
  return factors.map((f) => {
    if (f.key !== key) return f;
    const bounds = FACTOR_BOUNDS[key];
    return { ...f, delta: Math.min(bounds.max, Math.max(bounds.min, f.delta + by)) };
  });
}

export interface ScoreUpdate {
  factors: ScoreFactor[];
  previousScore: number;
  newScore: number;
  scoreChange: number;
  /** Which factor moved, for a UI callout. */
  changedFactor: ScoreFactorKey | null;
}

/**
 * Apply an analysed manoeuvre to the score breakdown.
 * - justified manoeuvre → +context-aware riding
 * - unexplained manoeuvre → deeper unexplained-manoeuvres penalty
 * - normal riding → no change
 */
export function applyEventToScore(
  factors: ScoreFactor[],
  result: ContextResult,
): ScoreUpdate {
  const previousScore = computeScore(factors);

  let changedFactor: ScoreFactorKey | null = null;
  let next = factors;

  const isManoeuvre = result.eventType !== "normal";
  if (isManoeuvre && isJustified(result.verdict)) {
    next = adjustFactor(factors, "context_aware", +2);
    changedFactor = "context_aware";
  } else if (isManoeuvre && result.verdict === "context_unclear") {
    next = adjustFactor(factors, "unexplained_manoeuvres", -1);
    changedFactor = "unexplained_manoeuvres";
  }

  const newScore = computeScore(next);
  return {
    factors: next,
    previousScore,
    newScore,
    scoreChange: newScore - previousScore,
    changedFactor,
  };
}
