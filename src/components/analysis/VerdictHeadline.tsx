import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import type { Verdict } from "@/types";
import { VERDICT_LABEL, VERDICT_QUALIFIER } from "@/config/labels";
import { verdictIcon, verdictTone } from "@/lib/ui";

/**
 * Big verdict lockup: icon + headline + qualifier, coloured by verdict tone.
 *
 * Light system per spec §4 "Evasive Move Verified": tertiary-fixed tile with
 * tertiary ink for justified, secondary-fixed with secondary ink for caution.
 */
export function VerdictHeadline({
  verdict,
  className,
}: {
  verdict: Verdict;
  className?: string;
}) {
  const tone = verdictTone(verdict);
  const color = tone === "justified" ? "text-tertiary" : "text-secondary";
  const ring =
    tone === "justified"
      ? "ring-tertiary/30 bg-tertiary-fixed/50"
      : "ring-secondary/30 bg-secondary-fixed/50";

  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <div
        className={cn(
          "mb-4 grid h-20 w-20 place-items-center rounded-full ring-1",
          ring,
        )}
      >
        <Icon name={verdictIcon(verdict)} className={cn("h-10 w-10", color)} strokeWidth={2.25} />
      </div>
      <div className={cn("text-3xl font-extrabold tracking-tight", color)}>
        {VERDICT_LABEL[verdict]}
      </div>
      <div className="mt-1.5 text-sm text-muted">{VERDICT_QUALIFIER[verdict]}</div>
    </div>
  );
}
