import type { HTMLAttributes, KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds a soft primary glow (used for hero/active surfaces). */
  glow?: boolean;
  padded?: boolean;
}

export function Card({ glow, padded = true, className, ...props }: CardProps) {
  const { onClick, onKeyDown, role, tabIndex, ...rest } = props;
  const clickable = Boolean(onClick);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !onClick || (event.key !== "Enter" && event.key !== " ")) {
      return;
    }
    event.preventDefault();
    event.currentTarget.click();
  };

  return (
    <div
      className={cn(
        "card",
        padded && "p-4",
        glow && "shadow-glow",
        clickable && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        className,
      )}
      {...rest}
      onClick={onClick}
      onKeyDown={clickable ? handleKeyDown : onKeyDown}
      role={clickable ? "button" : role}
      tabIndex={clickable ? (tabIndex ?? 0) : tabIndex}
    />
  );
}
