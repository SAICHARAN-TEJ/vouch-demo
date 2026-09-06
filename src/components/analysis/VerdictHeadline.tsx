import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import type { Verdict } from "@/types";
import { VERDICT_LABEL, VERDICT_QUALIFIER } from "@/config/labels";
import { verdictIcon, verdictTone } from "@/lib/ui";

/** Big verdict lockup: icon + headline + qualifier, coloured by verdict tone. */
export function VerdictHeadline({
  verdict,
  className,
}: {
  verdict: Verdict;
  className?: string;
}) {
  const tone = verdictTone(verdict);
  const color = tone === "justified" ? "text-justified" : "text-caution";
  const ring = tone === "justified" ? "ring-justified/30 bg-justified/10" : "ring-caution/30 bg-caution/10";

  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <div
        className={cn(
          "mb-4 grid h-20 w-20 place-items-center rounded-full ring-1",
          ring,
        )}
      >
        <Icon name={verdictIcon(verdict)} className={cn("h-10 w-10", color)} />
      </div>
      <div className={cn("text-3xl font-extrabold tracking-tight", color)}>
        {VERDICT_LABEL[verdict]}
      </div>
      <div className="mt-1.5 text-sm text-muted">{VERDICT_QUALIFIER[verdict]}</div>
    </div>
  );
}
