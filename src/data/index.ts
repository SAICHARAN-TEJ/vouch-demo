import { isSupabaseConfigured } from "@/lib/supabase";
import { localRepo } from "./localRepo";
import { supabaseRepo } from "./supabaseRepo";
import type { VouchRepository } from "./types";

export type { VouchRepository } from "./types";
export { localRepo } from "./localRepo";
export { supabaseRepo } from "./supabaseRepo";

let resolved: VouchRepository | null = null;
let pending: Promise<VouchRepository> | null = null;

/**
 * Resolve the active repository once, and memoise it.
 *
 * Uses Supabase only when it's both configured AND reachable/migrated;
 * otherwise transparently falls back to the seeded local repository. This is
 * the single decision point that guarantees the demo always has working data
 * (PRD §49).
 */
export function getRepository(): Promise<VouchRepository> {
  if (resolved) return Promise.resolve(resolved);
  if (pending) return pending;

  pending = (async (): Promise<VouchRepository> => {
    if (isSupabaseConfigured && (await supabaseRepo.healthCheck())) {
      resolved = supabaseRepo;
    } else {
      resolved = localRepo;
    }
    return resolved as VouchRepository;
  })();

  return pending;
}

/** Synchronous best-effort accessor (local until the async resolve completes). */
export function activeRepository(): VouchRepository {
  return resolved ?? localRepo;
}
