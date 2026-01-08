"use client";

import { Job } from "@/lib/types";
import { Button } from "@/components/ui";
import { candidateStages } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface JobConfigPanelProps {
  job: Job;
  onClose: () => void;
  onFilterCandidates: () => void;
  onSyncModeChange: (mode: Job["syncMode"]) => void;
  onStageToggle: (stage: string) => void;
}

export function JobConfigPanel({
  job,
  onClose,
  onFilterCandidates,
  onSyncModeChange,
  onStageToggle,
}: JobConfigPanelProps) {
  const syncOptions = [
    { value: "all" as const, label: "All candidates", desc: "Sync all candidates regardless of stage" },
    { value: "specific" as const, label: "Specific stages only", desc: "Only sync candidates in selected stages" },
    { value: "none" as const, label: "Don't sync", desc: "Skip this job when syncing" },
  ];

  return (
    <div className="w-[380px] bg-bg-secondary border-l border-border-subtle flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="p-5 border-b border-border-subtle">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">{job.title}</h2>
            <p className="text-sm text-text-tertiary">{job.reqId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-secondary transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Candidate Sync</h3>
        
        {/* Sync Options */}
        <div className="space-y-2 mb-6">
          {syncOptions.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                job.syncMode === option.value
                  ? "bg-accent/10 border-accent/30"
                  : "bg-bg-glass border-border-subtle hover:border-border-default"
              )}
            >
              <input
                type="radio"
                name="syncMode"
                checked={job.syncMode === option.value}
                onChange={() => onSyncModeChange(option.value)}
                className="mt-0.5 accent-accent"
              />
              <div>
                <div className="text-sm font-medium text-text-primary">{option.label}</div>
                <div className="text-xs text-text-tertiary">{option.desc}</div>
              </div>
            </label>
          ))}
        </div>

        {/* Stage Selection */}
        {job.syncMode === "specific" && (
          <div className="mb-6 animate-fade-in">
            <h4 className="text-xs font-medium text-text-tertiary uppercase tracking-wide mb-3">
              Select Stages
            </h4>
            <div className="space-y-2">
              {candidateStages.map((stage) => (
                <label
                  key={stage}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-bg-glass border border-border-subtle cursor-pointer hover:border-border-default transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={job.syncStages.includes(stage)}
                    onChange={() => onStageToggle(stage)}
                    className="accent-accent"
                  />
                  <span className="text-sm text-text-primary">{stage}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Last Sync Info */}
        <div className="text-sm text-text-tertiary">
          <span className="text-text-muted">Last synced</span>
          <span className="mx-2 text-text-primary">{job.lastSync}</span>
          <button className="text-accent hover:underline">View sync log</button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-border-subtle">
        <Button className="w-full" onClick={onFilterCandidates}>
          Filter Candidates
        </Button>
      </div>
    </div>
  );
}

