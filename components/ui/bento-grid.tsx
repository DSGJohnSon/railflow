import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
  cols?: number;
  span?: number;
}

export function BentoGrid({
  children,
  className,
  cols = 16,
  span,
}: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-8 gap-4 auto-rows-min items-start",
        className,
      )}
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridColumn: span ? `span ${span}` : undefined,
      }}
    >
      {children}
    </div>
  );
}
