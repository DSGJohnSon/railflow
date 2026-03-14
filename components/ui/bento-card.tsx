import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface BentoCardProps {
  children?: ReactNode;
  className?: string;
  span?: number;
  rowSpan?: number;
  title?: string;
  description?: string;
  icon?: ReactNode;
}

export function BentoCard({
  children,
  className,
  span = 1,
  rowSpan = 1,
}: BentoCardProps) {
  return (
    <Card
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-3xl",
        "bg-white",
        className
      )}
      style={{
        gridColumn: `span ${span}`,
        gridRow: `span ${rowSpan}`,
      }}
    >
      <CardContent className={cn("flex-1")}>
        {children}
      </CardContent>
    </Card>
  );
}
