import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ChipProps = {
  selected?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
};

export function Chip({
  selected,
  children,
  onClick,
  className,
  disabled,
}: ChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full px-3.5 text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:not-disabled:scale-[0.96]",
        selected
          ? "bg-primary text-primary-foreground shadow-[var(--shadow-border)]"
          : "bg-surface text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
        className,
      )}
    >
      {children}
    </button>
  );
}
