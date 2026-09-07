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
 *
 * Light chrome per spec §3: h-16, surface-container-lowest/95 + backdrop
 * blur, active = primary-container ink. The raised Ride key stays (our nav
 * has a centre tab) recoloured to the tonal system — a deep-teal filled key
 * with the white icon, seated on the bar.
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
        "relative z-20 flex h-16 shrink-0 items-stretch justify-around",
        "bg-surface-container-lowest/95 px-2 backdrop-blur-xl",
        "pb-[max(0.25rem,env(safe-area-inset-bottom))]",
      )}
      style={{ boxShadow: "0 -2px 10px rgb(0 0 0 / 0.04)" }}
    >
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
                    "border-4 border-bg bg-primary-container text-on-primary shadow-lifted",
                    "transition-[transform] duration-micro ease-hover",
                    "group-hover:-translate-y-0.5",
                    "group-active:translate-y-0 group-active:scale-95",
                    "group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-bg",
                    isActive && "scale-105",
                  )}
                >
                  <Icon name={it.icon} className="h-6 w-6" strokeWidth={2.25} />
                </span>
                <span className="mt-0.5 text-[11px] font-semibold text-primary-container">
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
              "group relative flex min-h-11 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-indicator"
                    aria-hidden="true"
                    className="absolute top-1 h-1 w-8 rounded-full bg-primary-container"
                    transition={a.springTransition("indicator")}
                  />
                )}
                <Icon
                  name={it.icon}
                  className={cn(
                    "h-5 w-5 transition-[color,transform] duration-micro ease-hover",
                    isActive
                      ? "-translate-y-px text-primary-container"
                      : "text-on-surface-variant group-hover:text-on-surface",
                  )}
                  strokeWidth={isActive ? 2.4 : 2}
                />
                <span
                  className={cn(
                    "text-[11px] tracking-[0.01em] transition-colors duration-micro",
                    isActive
                      ? "font-semibold text-primary-container"
                      : "font-medium text-on-surface-variant group-hover:text-on-surface",
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
