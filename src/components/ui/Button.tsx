import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger"; type Size = "sm" | "md" | "lg";
const VARIANTS: Record<Variant, string> = { primary: "bg-primary text-primary-fg hover:brightness-110 shadow-glow", secondary: "bg-elevated text-content hover:bg-elevated/80 hairline", outline: "hairline text-content hover:bg-white/5", ghost: "text-muted hover:text-content hover:bg-white/5", danger: "bg-danger/90 text-white hover:bg-danger" };
const SIZES: Record<Size, string> = { sm: "h-9 px-3 text-sm", md: "h-11 px-4 text-sm", lg: "h-14 px-6 text-base" };
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: Size; block?: boolean; }
export function Button({ variant = "primary", size = "md", block = false, className, ...props }: ButtonProps) { return <button className={cn("inline-flex select-none items-center justify-center gap-2 rounded-xl font-semibold transition", "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60", "disabled:pointer-events-none disabled:opacity-50", VARIANTS[variant], SIZES[size], block && "w-full", className)} {...props} />; }
