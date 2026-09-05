import type { ReactNode } from "react";
export function PhoneFrame({ children }: { children: ReactNode }) { return <div className="flex min-h-[100dvh] w-full justify-center"><div className="relative flex h-[100dvh] w-full max-w-[var(--phone-w)] flex-col overflow-hidden bg-bg sm:border-x sm:border-border/60">{children}</div></div>; }
