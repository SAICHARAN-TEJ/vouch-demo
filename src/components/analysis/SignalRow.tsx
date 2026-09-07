import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

export type SignalState = "on" | "off" | "checking";

/** One investigative signal row (motion / road context / rear approach).
 *
 * Light system per spec §4: row on surface-container-low, icon tile on white.
 */
export function SignalRow({
  icon,
  label,
  detail,
  state,
}: {
  icon: string;
  label: string;
  detail?: string;
  state: SignalState;
}) {
  const tone =
    state === "on"
      ? "text-tertiary"
      : state === "checking"
        ? "text-primary"
        : "text-muted";

  return (
    <div className="flex items-center gap-3 rounded-xl bg-surface-container-low px-3 py-2.5">
      <div
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-container-lowest",
          tone,
        )}
      >
        <Icon name={icon} className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-content">{label}</div>
        {detail && <div className="truncate text-xs text-muted">{detail}</div>}
      </div>
      <SignalIndicator state={state} />
    </div>
  );
}

function SignalIndicator({ state }: { state: SignalState }) {
  if (state === "checking") {
    return (
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    );
  }
  if (state === "on") {
    return (
      <span className="grid h-6 w-6 place-items-center rounded-full bg-tertiary-fixed text-tertiary">
        <Icon name="Check" className="h-4 w-4" strokeWidth={3} />
      </span>
    );
  }
  return <span className="text-xs font-medium text-muted">—</span>;
}
