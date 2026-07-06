import * as React from "react";
import { cn } from "../../lib/utils";

export interface ProgressIndicatorProps {
  /** 0 to 100 */
  value: number;
  variant?: "default" | "success" | "danger";
  className?: string;
}

export function ProgressIndicator({
  value,
  variant = "default",
  className,
}: ProgressIndicatorProps): JSX.Element {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn("w-full h-1.5 rounded-full bg-surface-hover overflow-hidden", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progress: ${clamped}%`}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500 ease-out",
          {
            "bg-primary": variant === "default",
            "bg-success": variant === "success",
            "bg-danger": variant === "danger",
          }
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
