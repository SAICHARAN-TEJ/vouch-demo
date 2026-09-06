import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { PhoneFrame } from "./PhoneFrame";
import { BottomNav } from "./BottomNav";
import { useRider } from "@/hooks/queries";
import { useScoreStore } from "@/store/scoreStore";

/** Routes that render full-bleed without the bottom nav (splash + live ride). */
const NO_NAV = new Set(["/", "/ride"]);

export function AppShell() {
  const { pathname } = useLocation();
  const { data: rider } = useRider();
  const showNav = !NO_NAV.has(pathname);

  useEffect(() => {
    if (rider) useScoreStore.getState().hydrate(rider);
  }, [rider]);

  return (
    <PhoneFrame>
      <main className="no-scrollbar relative flex-1 overflow-y-auto">
        <Outlet />
      </main>
      {showNav && <BottomNav />}
    </PhoneFrame>
  );
}
