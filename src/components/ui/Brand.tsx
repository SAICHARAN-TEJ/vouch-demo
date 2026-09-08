import { cn } from "@/lib/cn";

/**
 * Vouch wordmark + mark. `size` scales the mark; wordmark optional.
 * The mark is the spec §2 logo: deep-teal #0f5257 rounded square, white
 * check, cyan accent dot — rendered inline, static, no entrance animation.
 * A logo that re-animates every time its screen mounts reads as a template,
 * not a product.
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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 120 120"
        width={size}
        height={size}
        role="img"
        aria-label="Vouch"
        className="shrink-0"
      >
        <rect width="120" height="120" rx="28" fill="#0f5257" />
        <path
          d="M36 62 L52 78 L84 44"
          fill="none"
          stroke="#ffffff"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="84" cy="44" r="5" fill="#48cae4" />
      </svg>
      {showText && (
        // Display face with negative tracking: the wordmark should read as a
        // mark, not as body copy that happened to be bold.
        <span className="font-display text-lg font-extrabold tracking-[-0.02em] text-content">
          Vouch
        </span>
      )}
    </div>
  );
}
