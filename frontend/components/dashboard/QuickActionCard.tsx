import * as React from "react";
import { Card } from "../ui/Card";
import { cn } from "../../lib/utils";

export interface QuickActionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
  className?: string;
}

export function QuickActionCard({
  icon: Icon,
  title,
  description,
  onClick,
  className,
}: QuickActionCardProps): JSX.Element {
  return (
    <Card
      hoverable
      onClick={onClick}
      className={cn("flex flex-col p-5 text-left border border-border h-full justify-between transition-all duration-200", className)}
    >
      <div className="space-y-3">
        <div className="h-10 w-10 flex items-center justify-center rounded-medium bg-primary/10 text-primary border border-primary/20">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-heading-m font-bold text-text-primary mb-1">
            {title}
          </h3>
          <p className="text-small text-text-secondary leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      <div className="flex justify-end pt-4 text-primary font-semibold text-caption group-hover:underline">
        Launch Tool →
      </div>
    </Card>
  );
}
