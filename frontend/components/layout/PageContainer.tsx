import * as React from "react";
import { cn } from "../../lib/utils";

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <main
        ref={ref}
        className={cn(
          "flex-1 overflow-y-auto p-4 md:p-6 bg-background relative focus:outline-none",
          className
        )}
        tabIndex={-1}
        {...props}
      >
        {/* Background Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0" />
        
        <div className="relative z-10 mx-auto max-w-7xl w-full flex flex-col min-h-full">
          {children}
        </div>
      </main>
    );
  }
);

PageContainer.displayName = "PageContainer";
