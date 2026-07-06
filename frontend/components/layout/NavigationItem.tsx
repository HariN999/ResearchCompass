import * as React from "react";
import { cn } from "../../lib/utils";

export interface NavigationItemProps extends React.HTMLAttributes<HTMLButtonElement> {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  collapsed?: boolean;
}

export const NavigationItem = React.forwardRef<HTMLButtonElement, NavigationItemProps>(
  ({ className, icon: Icon, label, active = false, collapsed = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex items-center w-full rounded-medium transition-colors text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          {
            "bg-surface-hover text-primary font-semibold": active,
            "text-text-secondary hover:bg-surface-hover hover:text-text-primary": !active,
            "justify-center p-3": collapsed,
            "px-4 py-3 space-x-3 text-body": !collapsed,
          },
          className
        )}
        aria-label={label}
        {...props}
      >
        <Icon className={cn("h-5 w-5 shrink-0", active ? "text-primary" : "text-text-secondary")} />
        {!collapsed && <span className="truncate">{label}</span>}
      </button>
    );
  }
);

NavigationItem.displayName = "NavigationItem";
