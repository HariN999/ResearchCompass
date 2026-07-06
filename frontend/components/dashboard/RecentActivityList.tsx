import * as React from "react";
import { FileText, Columns, Sparkles } from "lucide-react";
import { Badge } from "../ui/Badge";

export interface ActivityItem {
  id: string;
  title: string;
  type: "analysis" | "comparison" | "lit-review";
  timestamp: string;
  detail: string;
}

export interface RecentActivityListProps {
  activities: ActivityItem[];
}

export function RecentActivityList({ activities }: RecentActivityListProps): JSX.Element {
  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "analysis":
        return <FileText className="h-4 w-4 text-primary" />;
      case "comparison":
        return <Columns className="h-4 w-4 text-warning" />;
      case "lit-review":
        return <Sparkles className="h-4 w-4 text-success" />;
    }
  };

  const getBadgeVariant = (type: ActivityItem["type"]) => {
    switch (type) {
      case "analysis":
        return "primary" as const;
      case "comparison":
        return "warning" as const;
      case "lit-review":
        return "success" as const;
    }
  };

  const getLabel = (type: ActivityItem["type"]) => {
    switch (type) {
      case "analysis":
        return "Analysis";
      case "comparison":
        return "Comparison";
      case "lit-review":
        return "Lit Review";
    }
  };

  return (
    <div className="overflow-hidden rounded-large border border-border bg-surface shadow-card select-none">
      <div className="px-6 py-4 border-b border-border text-left">
        <h3 className="text-heading-m font-bold text-text-primary">
          Recent Activity Logs
        </h3>
        <p className="text-small text-text-secondary">
          Overview of recently processed papers and generated literature review workspaces.
        </p>
      </div>

      <div className="divide-y divide-border">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-surface-hover transition-colors text-left gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1 h-8 w-8 flex items-center justify-center rounded-medium bg-surface border border-border">
                {getIcon(activity.type)}
              </div>
              <div className="space-y-1">
                <p className="text-body font-semibold text-text-primary">
                  {activity.title}
                </p>
                <p className="text-small text-text-secondary leading-relaxed">
                  {activity.detail}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:text-right shrink-0">
              <Badge variant={getBadgeVariant(activity.type)}>
                {getLabel(activity.type)}
              </Badge>
              <span className="text-small text-text-muted">
                {activity.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
