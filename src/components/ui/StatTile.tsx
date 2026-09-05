import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";
export function StatTile({ icon, value, label, sub, className, accent = "text-primary" }: { icon?: string; value: ReactNode; label: string; sub?: ReactNode; className?: string; accent?: string }) { return <div className={cn("card p-3.5", className)}>{icon && <div className={cn("mb-2 inline-grid h-8 w-8 place-items-center rounded-lg bg-white/5", accent)}><Icon name={icon} className="h-4 w-4" /></div>}<div className="tnum text-2xl font-bold leading-none text-content">{value}</div><div className="mt-1.5 text-xs font-medium text-muted">{label}</div>{sub && <div className="mt-0.5 text-[11px] text-muted/80">{sub}</div>}</div>; }
