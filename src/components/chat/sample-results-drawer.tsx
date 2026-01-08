"use client";

import { Candidate, Job } from "@/lib/types";
import { Button, Spinner } from "@/components/ui";
import { cn, getScoreColor, getScoreBg, getFitLabel } from "@/lib/utils";

interface SampleResultsDrawerProps {
  candidates: Candidate[];
  job: Job;
  isRunning: boolean;
  onClose: () => void;
  onRunAll: () => void;
  onViewResume: (candidate: Candidate) => void;
}

export function SampleResultsDrawer({
  candidates,
  job,
  isRunning,
  onClose,
  onRunAll,
  onViewResume,
}: SampleResultsDrawerProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-bg-secondary border-t border-white/10 rounded-t-2xl shadow-[0_-8px_32px_rgba(0,0,0,0.5)] z-50 max-h-[60vh] flex flex-col animate-slide-up">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center text-text-secondary hover:bg-white/[0.12] transition-colors"
            title="Close (Esc)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <h3 className="text-base font-semibold text-text-primary">Sample Results</h3>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-success/15 text-success">
            {candidates.length} candidates
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted flex items-center gap-1.5">
            Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[11px]">Esc</kbd> to close
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Edit Prompt
          </Button>
          <Button size="sm" onClick={onRunAll} loading={isRunning}>
            Run on all {job.candidateCount}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.08]">
              <th className="text-left py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wide w-[180px]">Candidate</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wide w-[80px]">Fit</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wide">Reasoning</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wide w-[80px]">Resume</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.id} className="border-b border-white/[0.04]">
                <td className="py-3.5 px-4 align-top">
                  <div className="font-medium text-text-primary text-sm">{candidate.name}</div>
                  <div className="text-xs text-text-tertiary mt-0.5">{candidate.currentRole}</div>
                </td>
                <td className="py-3.5 px-4 align-top">
                  <span className={cn(
                    "inline-flex px-2.5 py-1 rounded-full text-xs font-medium",
                    getScoreBg(candidate.score),
                    getScoreColor(candidate.score)
                  )}>
                    {getFitLabel(candidate.score)}
                  </span>
                </td>
                <td className="py-3.5 px-4 align-top">
                  <p className="text-sm text-text-secondary leading-relaxed">{candidate.reason}</p>
                </td>
                <td className="py-3.5 px-4 text-center align-top">
                  <button
                    onClick={() => onViewResume(candidate)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple/15 text-purple text-xs hover:bg-purple/25 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

