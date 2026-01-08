"use client";

import { Job } from "@/lib/types";
import { cn } from "@/lib/utils";

interface JobCardProps {
  job: Job;
  isSelected: boolean;
  onClick: () => void;
}

export function JobCard({ job, isSelected, onClick }: JobCardProps) {
  const syncIndicator = {
    all: { color: "bg-success", label: "All synced" },
    specific: { color: "bg-purple", label: `${job.syncStages.length} stages` },
    none: { color: "bg-text-muted", label: "Not syncing" },
  }[job.syncMode];

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl border cursor-pointer transition-all duration-150",
        isSelected
          ? "bg-bg-card-hover border-accent/30"
          : "bg-bg-card border-border-subtle hover:bg-bg-card-hover hover:border-border-default"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-text-primary truncate">{job.title}</h3>
            <span className={cn(
              "px-2 py-0.5 rounded text-xs font-medium",
              job.status === "Open" ? "bg-success/15 text-success" : "bg-bg-glass text-text-muted"
            )}>
              {job.status}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
            <span>{job.location}</span>
            <span>•</span>
            <span>{job.workType}</span>
            <span>•</span>
            <span>{job.reqId}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          <span className="text-text-secondary">{job.candidateCount} candidates</span>
          <div className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", syncIndicator.color)} />
            <span className="text-text-tertiary">{syncIndicator.label}</span>
          </div>
        </div>
        <span className="text-xs text-text-muted">{job.lastSync}</span>
      </div>
    </div>
  );
}

