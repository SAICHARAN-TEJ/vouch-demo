import { localRepo } from "./localRepo";
import type { VouchRepository } from "./types";

export type { VouchRepository } from "./types";
export { localRepo } from "./localRepo";

let resolved: VouchRepository | null = null;
let pending: Promise<VouchRepository> | null = null;

/**
 * Resolve the active repository once, and memoise it.
 *
 * Uses Supabase only when it's both configured AND reachable/migrated;
 * otherwise transparently falls back to the seeded local repository. This is
 * the single decision point that guarantees the demo always has working data
 * (PRD §49).
 *
 * The Supabase branch is imported lazily: the local-first demo (the default,
 * and the GitHub Pages deployment) never pays for the Supabase JS client in
 * the entry chunk — it is fetched only when env vars are actually present.
 */
export function getRepository(): Promise<VouchRepository> {
  if (resolved) return Promise.resolve(resolved);
  if (pending) return pending;

  pending = (async (): Promise<VouchRepository> => {
    const configured = Boolean(
      import.meta.env.VITE_SUPABASE_URL?.trim() &&
        import.meta.env.VITE_SUPABASE_ANON_KEY?.trim(),
    );
    if (configured) {
      const { supabaseRepo } = await import("./supabaseRepo");
      if (await supabaseRepo.healthCheck()) {
        resolved = supabaseRepo;
      }
    }
    resolved ??= localRepo;
    return resolved;
  })();

  return pending;
}

/** Synchronous best-effort accessor (local until the async resolve completes). */
export function activeRepository(): VouchRepository {
  return resolved ?? localRepo;
}
