import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
export type BadgeTone = "neutral" | "primary" | "justified" | "caution" | "danger" | "info";
const TONES: Record<BadgeTone, string> = { neutral: "bg-white/5 text-muted ring-1 ring-inset ring-border", primary: "bg-primary/15 text-primary ring-1 ring-inset ring-primary/30", justified: "bg-justified/15 text-justified ring-1 ring-inset ring-justified/30", caution: "bg-caution/15 text-caution ring-1 ring-inset ring-caution/30", danger: "bg-danger/15 text-danger ring-1 ring-inset ring-danger/30", info: "bg-info/15 text-info ring-1 ring-inset ring-info/30" };
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> { tone?: BadgeTone; }
export function Badge({ tone = "neutral", className, ...props }: BadgeProps) { return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", TONES[tone], className)} {...props} />; }
