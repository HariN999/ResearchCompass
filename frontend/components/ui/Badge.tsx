import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "outline";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-medium transition-colors border",
          {
            "bg-primary/10 text-primary border-primary/20": variant === "primary",
            "bg-surface text-text-secondary border-border": variant === "secondary",
            "bg-success/10 text-success border-success/20": variant === "success",
            "bg-warning/10 text-warning border-warning/20": variant === "warning",
            "bg-danger/10 text-danger border-danger/20": variant === "danger",
            "bg-transparent text-text-primary border-border": variant === "outline",
          },
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
