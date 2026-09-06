import { describe, it, expect } from "vitest";
import {
  applyEventToScore,
  BASE_SCORE,
  computeScore,
  DEFAULT_FACTORS,
} from "./scoreEngine";
import type { ContextResult } from "@/types";

function result(partial: Partial<ContextResult>): ContextResult {
  return {
    eventType: "lateral_manoeuvre",
    context: [],
    confidence: 0.8,
    verdict: "likely_justified",
    explanation: "",
    signals: { motion: true, roadContext: true, rearApproach: false },
    nearbyEvent: null,
    cameraDetection: null,
    hazardDistanceM: null,
    ...partial,
  };
}

describe("Vouch Score engine (PRD §16)", () => {
  it("default breakdown sums to the dashboard figure of 87", () => {
    expect(BASE_SCORE).toBe(74);
    expect(computeScore(DEFAULT_FACTORS)).toBe(87);
  });

  it("rewards a context-justified manoeuvre (context-aware riding +2)", () => {
    const update = applyEventToScore(
      DEFAULT_FACTORS,
      result({ verdict: "high_confidence_likely_justified" }),
    );
    expect(update.changedFactor).toBe("context_aware");
    expect(update.scoreChange).toBe(2);
    expect(update.newScore).toBe(89);
  });

  it("penalises an unexplained manoeuvre", () => {
    const update = applyEventToScore(
      DEFAULT_FACTORS,
      result({ verdict: "context_unclear", context: [] }),
    );
    expect(update.changedFactor).toBe("unexplained_manoeuvres");
    expect(update.scoreChange).toBe(-1);
    expect(update.newScore).toBe(86);
  });

  it("leaves the score unchanged for normal riding", () => {
    const update = applyEventToScore(
      DEFAULT_FACTORS,
      result({ eventType: "normal", verdict: "context_unclear" }),
    );
    expect(update.changedFactor).toBeNull();
    expect(update.scoreChange).toBe(0);
    expect(update.newScore).toBe(87);
  });

  it("clamps repeated rewards within factor bounds", () => {
    let factors = DEFAULT_FACTORS;
    for (let i = 0; i < 20; i++) {
      factors = applyEventToScore(
        factors,
        result({ verdict: "likely_justified" }),
      ).factors;
    }
    expect(computeScore(factors)).toBeLessThanOrEqual(100);
  });
});
