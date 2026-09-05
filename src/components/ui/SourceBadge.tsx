import { useDataSource } from "@/hooks/queries";
import { Icon } from "./Icon";
import { cn } from "@/lib/cn";
export function SourceBadge({ className }: { className?: string }) { const { data: source } = useDataSource(); const live = source === "supabase"; return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset", live ? "bg-primary/15 text-primary ring-primary/30" : "bg-white/5 text-muted ring-border", className)}><Icon name={live ? "Wifi" : "Database"} className="h-3 w-3" />{live ? "Live" : "Local"}</span>; }
