import { cn } from "@/lib/cn";

/** Vouch wordmark + shield. `size` scales the shield; wordmark optional. */
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
      <img src="/vouch.svg" width={size} height={size} alt="Vouch" className="animate-fade-in" />
      {showText && (
        <span className="text-lg font-extrabold tracking-tight text-content">
          Vouch
        </span>
      )}
    </div>
  );
}
