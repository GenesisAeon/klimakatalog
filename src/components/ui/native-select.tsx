import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function NativeSelect({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-11 w-full appearance-none rounded-md bg-surface py-0 pr-9 pl-3 text-sm text-fg shadow-[var(--shadow-border)]",
          "outline-none transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]",
          "focus-visible:ring-2 focus-visible:ring-ring/70 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        style={{ backgroundColor: "#141a18", color: "#e8eee9" }}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" />
    </div>
  );
}
