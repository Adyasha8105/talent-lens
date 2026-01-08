"use client";

import { Job } from "@/lib/types";
import { Button, Spinner } from "@/components/ui";

interface PromptPanelProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  job: Job;
  isTesting: boolean;
  isRunning: boolean;
  hasSampleResults: boolean;
  onTestSample: () => void;
  onRunAll: () => void;
}

export function PromptPanel({
  prompt,
  onPromptChange,
  job,
  isTesting,
  isRunning,
  hasSampleResults,
  onTestSample,
  onRunAll,
}: PromptPanelProps) {
  return (
    <div className="w-[380px] border-l border-white/[0.06] bg-bg-secondary flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Generated Prompt</h3>
        <span className="text-xs text-text-muted">Editable</span>
      </div>

      {/* Prompt Editor */}
      <div className="flex-1 p-5 overflow-auto">
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className="w-full h-full min-h-[200px] p-3.5 rounded-lg border border-white/10 bg-white/[0.03] text-sm font-mono leading-relaxed text-text-primary resize-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
        />
      </div>

      {/* Actions */}
      <div className="p-5 border-t border-white/[0.06] space-y-2.5">
        <Button
          variant="secondary"
          className="w-full"
          onClick={onTestSample}
          loading={isTesting}
        >
          {isTesting ? "Testing..." : "Test on 5 candidates"}
        </Button>
        <Button
          className="w-full"
          onClick={onRunAll}
          loading={isRunning}
          disabled={!hasSampleResults}
        >
          {isRunning ? "Analyzing..." : `Run on all ${job.candidateCount}`}
        </Button>
      </div>
    </div>
  );
}

