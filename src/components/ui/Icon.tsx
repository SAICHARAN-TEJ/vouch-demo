import {
  Activity,
  ArrowLeft,
  Bike,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleDot,
  CircleHelp,
  Clock,
  Construction,
  Database,
  Eye,
  Gauge,
  HelpCircle,
  Home,
  Info,
  Map,
  MapPin,
  MoveHorizontal,
  Navigation,
  Octagon,
  Play,
  Plus,
  Radar,
  RectangleHorizontal,
  RotateCcw,
  Route,
  ScanLine,
  ShieldCheck,
  ShieldQuestion,
  Sparkles,
  Square,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Users,
  Waves,
  Wifi,
  WifiOff,
  X,
  Zap,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";
import type { RoadEventType } from "@/types";

/**
 * Curated icon registry. Scenario/hazard configs reference icons by string name,
 * so we resolve them here rather than importing lucide across the app.
 */
const REGISTRY: Record<string, ComponentType<LucideProps>> = {
  Activity,
  ArrowLeft,
  Bike,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleDot,
  CircleHelp,
  Clock,
  Construction,
  Database,
  Eye,
  Gauge,
  HelpCircle,
  Home,
  Info,
  Map,
  MapPin,
  MoveHorizontal,
  Navigation,
  Octagon,
  Play,
  Plus,
  Radar,
  RectangleHorizontal,
  RotateCcw,
  Route,
  ScanLine,
  ShieldCheck,
  ShieldQuestion,
  Sparkles,
  Square,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Users,
  Waves,
  Wifi,
  WifiOff,
  X,
  Zap,
};

/**
 * Icons are decorative by default: they sit next to a text label or inside a
 * control that already has an `aria-label`, so announcing them again is noise.
 * Pass `label` for the rare standalone icon that carries meaning on its own.
 */
export function Icon({
  name,
  className,
  strokeWidth = 2,
  label,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
  label?: string;
}) {
  const Cmp = REGISTRY[name] ?? CircleDot;
  return (
    <Cmp
      className={className}
      strokeWidth={strokeWidth}
      focusable="false"
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true })}
    />
  );
}

/** Icon name for each hazard type (used on markers and detail cards). */
export const HAZARD_ICON: Record<RoadEventType, string> = {
  pothole: "CircleDot",
  speed_breaker: "RectangleHorizontal",
  waterlogging: "Waves",
  debris: "Construction",
};
