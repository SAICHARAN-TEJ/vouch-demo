import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

export function ExplanationCard({ explanation, title = "Vouch's reasoning", className }: { explanation: string; title?: string; className?: string }) {
  return <div className={cn("rounded-xl bg-white/[0.03] p-3.5 hairline", className)}><div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted"><Icon name="Sparkles" className="h-3.5 w-3.5 text-primary" />{title}</div><p className="text-sm leading-relaxed text-content">{explanation}</p></div>;
}
