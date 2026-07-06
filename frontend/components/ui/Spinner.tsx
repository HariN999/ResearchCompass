import * as React from "react";
import { cn } from "../../lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "animate-spin rounded-full border-2 border-border border-t-primary",
          {
            "h-4 w-4": size === "sm",
            "h-8 w-8": size === "md",
            "h-12 w-12": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Spinner.displayName = "Spinner";
