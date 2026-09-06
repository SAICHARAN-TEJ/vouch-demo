import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { useAnimationConfig } from "@/hooks/useAnimationConfig";

/**
 * Animation: nav-indicator
 * Trigger: route change (the active NavLink owns the shared layout element)
 * Duration: spring, stiffness 520 / damping 34  Easing: spring "indicator"
 * Properties: transform — framer's shared-layout animation moves the element
 *   with a translate, so nothing reflows
 * Stagger: n/a
 * Reduced motion: the indicator jumps to the new tab instantly (0.001s tween);
 *   the icon and label colour change still communicates the state.
 *
 * Items are links, never buttons — this is navigation, and screen-reader users
 * should hear "link". Do not convert them.
 */

interface NavItem {
  to: string;
  label: string;
  icon: string;
  center?: boolean;
}

const ITEMS: NavItem[] = [
  { to: "/home", label: "Home", icon: "Home" },
  { to: "/map", label: "Map", icon: "Map" },
  { to: "/ride", label: "Ride", icon: "Radar", center: true },
  { to: "/score", label: "Score", icon: "Gauge" },
  { to: "/history", label: "History", icon: "Clock" },
];

export function BottomNav() {
  const a = useAnimationConfig();

  return (
    <nav
      aria-label="Primary navigation"
      className={cn(
        "relative z-20 flex min-h-nav items-stretch justify-around",
        "bg-surface/85 px-2 pt-1.5 backdrop-blur-xl",
        "pb-[max(0.5rem,env(safe-area-inset-bottom))]",
      )}
    >
      {/* Top edge: brightest in the middle, under the raised Ride key. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      />

      {ITEMS.map((it) =>
        it.center ? (
          <NavLink
            key={it.to}
            to={it.to}
            className="group relative flex min-h-11 flex-1 flex-col items-center focus-visible:outline-none"
          >
            {({ isActive }) => (
              <>
                {/* Raised key. The bg-coloured border cuts it out of the nav
                    bar so it reads as sitting proud of the surface. */}
                <span
                  className={cn(
                    "-mt-6 grid h-14 w-14 place-items-center rounded-full",
                    "border-4 border-bg bg-gradient-to-b from-primary to-primary/80 text-primary-fg shadow-signal",
                    "transition-[transform,filter] duration-micro ease-hover",
                    "group-hover:-translate-y-0.5 group-hover:brightness-[1.06]",
                    "group-active:translate-y-0 group-active:scale-95",
                    "group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-surface",
                    isActive && "scale-105 brightness-110",
                  )}
                >
                  <Icon name={it.icon} className="h-6 w-6" strokeWidth={2.25} />
                </span>
                <span className="mt-0.5 text-[10px] font-semibold tracking-[0.01em] text-primary">
                  {it.label}
                </span>
              </>
            )}
          </NavLink>
        ) : (
          <NavLink
            key={it.to}
            to={it.to}
            className={cn(
              "group relative flex min-h-11 flex-1 flex-col items-center justify-center gap-1 rounded-control py-1.5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-indicator"
                    aria-hidden="true"
                    className="absolute -top-px h-0.5 w-7 rounded-full bg-primary shadow-[0_0_12px_1px_rgb(var(--c-primary)/0.6)]"
                    transition={a.springTransition("indicator")}
                  />
                )}
                <Icon
                  name={it.icon}
                  className={cn(
                    "h-5 w-5 transition-[color,transform] duration-micro ease-hover",
                    isActive
                      ? "-translate-y-px text-primary"
                      : "text-muted group-hover:text-content",
                  )}
                  strokeWidth={isActive ? 2.4 : 2}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium tracking-[0.01em] transition-colors duration-micro",
                    isActive
                      ? "font-semibold text-primary"
                      : "text-muted group-hover:text-content",
                  )}
                >
                  {it.label}
                </span>
              </>
            )}
          </NavLink>
        ),
      )}
    </nav>
  );
}
