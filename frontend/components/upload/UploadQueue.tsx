import * as React from "react";
import { cn } from "../../lib/utils";
import { UploadQueueItem } from "./UploadQueueItem";
import { QueueSummary } from "./QueueSummary";
import type { QueueItem } from "./queue-types";

export interface UploadQueueProps {
  items: QueueItem[];
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
  className?: string;
}

export function UploadQueue({
  items,
  onRemove,
  onRetry,
  className,
}: UploadQueueProps): JSX.Element {
  if (items.length === 0) return <></>;

  return (
    <div className={cn("space-y-4", className)}>
      <QueueSummary items={items} />
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {items.map((item) => (
          <UploadQueueItem
            key={item.id}
            item={item}
            onRemove={onRemove}
            onRetry={onRetry}
          />
        ))}
      </div>
    </div>
  );
}
