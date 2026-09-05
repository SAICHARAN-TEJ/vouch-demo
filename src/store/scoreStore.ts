import { create } from "zustand";
import type { ContextResult, Rider, ScoreFactor, ScoreFactorKey } from "@/types";
import {
  applyEventToScore,
  computeScore,
  DEFAULT_FACTORS,
} from "@/engine/scoreEngine";

interface ScoreState {
  factors: ScoreFactor[];
  score: number;
  /** Last delta applied, for a transient "+2" UI callout. */
  lastChange: number;
  lastChangedFactor: ScoreFactorKey | null;
  hydrate: (rider: Rider) => void;
  applyEvent: (result: ContextResult) => number;
  reset: () => void;
}

const initialFactors = DEFAULT_FACTORS.map((f) => ({ ...f }));

export const useScoreStore = create<ScoreState>((set) => ({
  factors: initialFactors,
  score: computeScore(initialFactors),
  lastChange: 0,
  lastChangedFactor: null,

  hydrate: (rider) =>
    set({
      factors: rider.scoreFactors.map((factor) => ({ ...factor })),
      score: rider.vouchScore,
      lastChange: 0,
      lastChangedFactor: null,
    }),

  applyEvent: (result) => {
    let change = 0;
    set((state) => {
      const update = applyEventToScore(state.factors, result);
      change = update.scoreChange;
      return {
        factors: update.factors,
        score: update.newScore,
        lastChange: update.scoreChange,
        lastChangedFactor: update.changedFactor,
      };
    });
    return change;
  },

  reset: () =>
    set(() => {
      const factors = DEFAULT_FACTORS.map((f) => ({ ...f }));
      return {
        factors,
        score: computeScore(factors),
        lastChange: 0,
        lastChangedFactor: null,
      };
    }),
}));
