import { useLocation, useOutlet } from "react-router-dom";
import { useEffect, useRef } from "react";
import { PhoneFrame } from "./PhoneFrame";
import { BottomNav } from "./BottomNav";
import { PageTransition, resetScrollReveals } from "@/components/motion";
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
        {fullBleed ? outlet : <PageTransition>{outlet}</PageTransition>}
      </main>
      {showNav && <BottomNav />}
    </PhoneFrame>
  );
}
