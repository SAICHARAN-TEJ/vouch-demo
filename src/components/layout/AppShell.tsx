import { useLocation, useOutlet } from "react-router-dom";
import { Suspense, useEffect, useRef } from "react";
import { PhoneFrame } from "./PhoneFrame";
import { BottomNav } from "./BottomNav";
import { PageTransition, resetScrollReveals } from "@/components/motion";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import { useRider } from "@/hooks/queries";
import { useScoreStore } from "@/store/scoreStore";

/**
 * Routes that render full-bleed without the bottom nav (splash + live ride).
 *
 * These two also opt out of the page transition. Both size themselves with
 * `h-full` against the frame, and an extra wrapper div would give them an
 * auto-height parent to resolve against — collapsing the screen to nothing.
 */
const NO_NAV = new Set(["/", "/ride"]);

/**
 * Route-level loading state for the lazily imported screens (App.tsx §8
 * code-splitting). §7 asks for designed loading states, never default
 * spinners, so this is composed from the same Skeleton primitives the
 * screens themselves use — a lazily resolving route reads as the app's own
 * loading language, not a blank flash.
 *
 * A11y: the raw skeletons are aria-hidden decoration; the single
 * `SkeletonCard` carries the one polite live region, so "Loading" is
 * announced exactly once (no stacked-live-region announce).
 *
 * Sizing: full-bleed routes (splash, ride) resolve their `h-full` against
 * `<main>`, so the fallback must size the same way or the frame collapses
 * while a full-bleed chunk loads.
 */
function RouteFallback() {
  return (
    <div className="flex h-full flex-col gap-4 p-5">
      <Skeleton height="h-6" width="w-1/3" shape="panel" />
      <Skeleton height="h-4" width="w-2/3" shape="cell" delay={90} />
      <SkeletonCard className="mt-8" />
    </div>
  );
}

export function AppShell() {
  const { pathname } = useLocation();
  const { data: rider } = useRider();
  // useOutlet returns the *resolved* element. PageTransition needs this rather
  // than <Outlet />, which would re-render the outgoing copy as the new screen.
  const outlet = useOutlet();
  const mainRef = useRef<HTMLElement>(null);

  const fullBleed = NO_NAV.has(pathname);
  const showNav = !fullBleed;

  useEffect(() => {
    if (rider) useScoreStore.getState().hydrate(rider);
  }, [rider]);

  useEffect(() => {
    // New screen starts at the top, and its scroll reveals are armed again so
    // returning to a screen still plays its entrance.
    mainRef.current?.scrollTo({ top: 0 });
    resetScrollReveals();
  }, [pathname]);

  return (
    <PhoneFrame>
      <main ref={mainRef} className="no-scrollbar relative flex-1 overflow-y-auto">
        <Suspense fallback={<RouteFallback />}>
          {fullBleed ? outlet : <PageTransition>{outlet}</PageTransition>}
        </Suspense>
      </main>
      {showNav && <BottomNav />}
    </PhoneFrame>
  );
}
