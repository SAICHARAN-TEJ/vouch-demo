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

export function Icon({
  name,
  className,
  strokeWidth = 2,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  const Cmp = REGISTRY[name] ?? CircleDot;
  return <Cmp className={className} strokeWidth={strokeWidth} />;
}

/** Icon name for each hazard type (used on markers and detail cards). */
export const HAZARD_ICON: Record<RoadEventType, string> = {
  pothole: "CircleDot",
  speed_breaker: "RectangleHorizontal",
  waterlogging: "Waves",
  debris: "Construction",
};
