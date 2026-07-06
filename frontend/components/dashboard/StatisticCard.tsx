import * as React from "react";
import { Card } from "../ui/Card";
import { cn } from "../../lib/utils";

export interface StatisticCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  change?: string;
  changeType?: "positive" | "neutral" | "negative";
  className?: string;
}

export function StatisticCard({
  label,
  value,
  icon: Icon,
  change,
  changeType = "positive",
  className,
}: StatisticCardProps): JSX.Element {
  return (
    <Card className={cn("p-5 flex items-center justify-between border border-border", className)}>
      <div className="space-y-1.5 text-left">
        <span className="text-small text-text-secondary select-none">
          {label}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-heading-l font-bold text-text-primary">
            {value}
          </span>
          {change && (
            <span
              className={cn("text-caption font-semibold", {
                "text-success": changeType === "positive",
                "text-text-secondary": changeType === "neutral",
                "text-danger": changeType === "negative",
              })}
            >
              {change}
            </span>
          )}
        </div>
      </div>
      <div className="h-10 w-10 flex items-center justify-center rounded-medium bg-surface-hover text-text-secondary border border-border">
        <Icon className="h-5 w-5" />
      </div>
    </Card>
  );
}
