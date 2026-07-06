import * as React from "react";
import { Menu, Search, Moon, Sun } from "lucide-react";
import { cn } from "../../lib/utils";

export interface HeaderProps {
  title: string;
  breadcrumbs?: string[];
  onOpenMobileMenu?: () => void;
  className?: string;
}

export function Header({
  title,
  breadcrumbs = ["Home"],
  onOpenMobileMenu,
  className,
}: HeaderProps): JSX.Element {
  return (
    <header
      className={cn(
        "flex h-16 items-center justify-between border-b border-border bg-surface px-4 md:px-6 z-20 sticky top-0 w-full shrink-0",
        className
      )}
    >
      {/* Breadcrumbs / Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden h-9 w-9 flex items-center justify-center rounded-medium border border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Open mobile menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex flex-col">
          {/* Breadcrumb path */}
          <span className="text-small text-text-muted select-none">
            {breadcrumbs.join(" / ")}
          </span>
          {/* Current Page Title */}
          <h1 className="text-heading-m font-bold text-text-primary leading-tight">
            {title}
          </h1>
        </div>
        <div className="sm:hidden flex flex-col">
          <h1 className="text-heading-m font-bold text-text-primary leading-tight">
            {title}
          </h1>
        </div>
      </div>

      {/* Global Actions Block */}
      <div className="flex items-center gap-4">
        {/* Mock Search (Non-functional Placeholder) */}
        <div className="relative hidden md:block w-64 select-none">
          <span className="absolute inset-y-0 left-3 flex items-center text-text-muted pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search papers semantically..."
            disabled
            className="w-full pl-9 pr-4 py-1.5 text-small rounded-medium border border-border bg-background placeholder:text-text-muted opacity-80 cursor-not-allowed"
          />
        </div>

        {/* Theme Toggle (Non-functional design placeholder) */}
        <button
          type="button"
          disabled
          aria-label="Toggle theme (disabled)"
          className="h-9 w-9 flex items-center justify-center rounded-medium border border-border text-text-muted bg-background/50 cursor-not-allowed select-none"
        >
          <Moon className="h-[18px] w-[18px]" />
        </button>
      </div>
    </header>
  );
}
