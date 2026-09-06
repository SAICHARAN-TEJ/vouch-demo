import { cn } from "@/lib/cn";

/**
 * Animation: brand-arrive
 * Trigger: mount
 * Duration: 480ms mark, 480ms wordmark at +90ms  Easing: entrance
 * Properties: transform + opacity
 * Stagger: 90ms — the shield lands, then the word
 * Reduced motion: both fade in place via the global duration collapse.
 *
 * Vouch wordmark + shield. `size` scales the shield; wordmark optional.
 */
export function Brand({
  size = 28,
  showText = true,
  className,
}: {
  size?: number;
  showText?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <img
        src="/vouch.svg"
        width={size}
        height={size}
        alt="Vouch"
        className="animate-scale-in [filter:drop-shadow(0_0_12px_rgb(var(--c-primary)/0.35))]"
      />
      {showText && (
        // Display face with negative tracking: the wordmark should read as a
        // mark, not as body copy that happens to be bold.
        <span
          className="animate-fade-up font-display text-lg font-extrabold tracking-[-0.03em] text-content"
          style={{ animationDelay: "90ms" }}
        >
          Vouch
        </span>
      )}
    </div>
  );
}
