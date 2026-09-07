import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

/**
 * "Vouch's reasoning" panel — the plain-language explanation from the Context
 * Engine. Reused by the verdict overlay, the road-event screen and history.
 *
 * Light system per spec §4: surface-container-low inner panel.
 */
export function ExplanationCard({
  explanation,
  title = "Vouch's reasoning",
  className,
}: {
  explanation: string;
  title?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl bg-surface-container-low p-3.5", className)}>
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
        <Icon name="Sparkles" className="h-3.5 w-3.5 text-primary" />
        {title}
      </div>
      <p className="text-sm leading-relaxed text-content">{explanation}</p>
    </div>
  );
}
