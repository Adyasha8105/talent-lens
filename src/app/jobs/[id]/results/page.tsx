"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Candidate } from "@/lib/types";
import { mockJobs, mockCandidates } from "@/lib/mock-data";
import { cn, getScoreColor, getScoreBg, getFitLabel, getStageBadgeStyles } from "@/lib/utils";
import { Button, Card } from "@/components/ui";
import { ResumeModal } from "@/components/chat/resume-modal";

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

type FilterKey = "all" | "excellent" | "strong" | "potential" | "weak";

export default function ResultsPage({ params }: ResultsPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const job = mockJobs.find((j) => j.id === id);

  const [scoreFilter, setScoreFilter] = useState<FilterKey>("all");
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
  const [viewingResume, setViewingResume] = useState<Candidate | null>(null);

  if (!job) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary">
        <p className="text-text-secondary">Job not found</p>
      </div>
    );
  }

  const sortedCandidates = [...mockCandidates].sort((a, b) => b.score - a.score);
  const excellentMatches = sortedCandidates.filter((c) => c.score >= 90).length;
  const strongMatches = sortedCandidates.filter((c) => c.score >= 75 && c.score < 90).length;
  const potentialMatches = sortedCandidates.filter((c) => c.score >= 60 && c.score < 75).length;

  const filteredCandidates = sortedCandidates.filter((c) => {
    if (scoreFilter === "all") return true;
    if (scoreFilter === "excellent") return c.score >= 90;
    if (scoreFilter === "strong") return c.score >= 75 && c.score < 90;
    if (scoreFilter === "potential") return c.score >= 60 && c.score < 75;
    if (scoreFilter === "weak") return c.score < 60;
    return true;
  });

  const filterTabs: { key: FilterKey; label: string; count: number; color?: string }[] = [
    { key: "all", label: "All", count: sortedCandidates.length },
    { key: "excellent", label: "Strong Fit", count: excellentMatches, color: "text-success" },
    { key: "strong", label: "Good Fit", count: strongMatches, color: "text-accent" },
    { key: "potential", label: "Moderate", count: potentialMatches, color: "text-warning" },
    { key: "weak", label: "Review", count: sortedCandidates.filter((c) => c.score < 60).length, color: "text-error" },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="px-10 py-6 border-b border-border-subtle bg-bg-secondary flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Button variant="secondary" onClick={() => router.push(`/jobs/${id}/chat`)}>
            <BackIcon /> Edit Criteria
          </Button>
          <div>
            <h1 className="text-xl font-bold text-text-primary mb-1">Candidate Results</h1>
            <p className="text-sm text-text-tertiary">
              {job.title} • {sortedCandidates.length} candidates analyzed
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.push("/jobs")}>
          Back to Jobs
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="px-10 py-8 grid grid-cols-4 gap-5">
        <Card className="p-6">
          <div className="text-sm text-text-tertiary uppercase tracking-wide mb-2">Total Candidates</div>
          <div className="text-4xl font-bold text-text-primary">{sortedCandidates.length}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-success uppercase tracking-wide mb-2">Strong Fit (90+)</div>
          <div className="text-4xl font-bold text-success">{excellentMatches}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-accent uppercase tracking-wide mb-2">Good Fit (75-89)</div>
          <div className="text-4xl font-bold text-accent">{strongMatches}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-warning uppercase tracking-wide mb-2">Moderate Fit (60-74)</div>
          <div className="text-4xl font-bold text-warning">{potentialMatches}</div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="px-10 pb-5">
        <div className="inline-flex gap-2 p-1.5 bg-bg-card rounded-xl border border-border-subtle">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setScoreFilter(tab.key)}
              className={cn(
                "px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all",
                scoreFilter === tab.key
                  ? "bg-bg-tertiary " + (tab.color || "text-text-primary")
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {tab.label}
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-semibold",
                scoreFilter === tab.key ? "bg-bg-glass" : "bg-bg-glass text-text-muted"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Table */}
      <div className="px-10 pb-10">
        <Card className="overflow-hidden">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-tertiary">
                  <th className="w-10 p-4"></th>
                  {["#", "Name", "Role", "Stage", "Location", "Exp", "Fit", "Resume"].map((col) => (
                    <th key={col} className="p-4 text-left font-semibold text-text-secondary border-b border-border-subtle">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate, index) => {
                  const stageBadge = getStageBadgeStyles(candidate.stage);
                  const isExpanded = expandedCandidate === candidate.id;

                  return (
                    <>
                      <tr
                        key={candidate.id}
                        onClick={() => setExpandedCandidate(isExpanded ? null : candidate.id)}
                        className={cn(
                          "cursor-pointer transition-colors",
                          isExpanded ? "bg-bg-glass" : "hover:bg-bg-glass-hover",
                          !isExpanded && "border-b border-border-subtle"
                        )}
                      >
                        <td className="p-4 text-center">
                          <span className={cn(
                            "inline-block transition-transform",
                            isExpanded && "rotate-90"
                          )}>
                            ▶
                          </span>
                        </td>
                        <td className="p-4 text-text-muted">{index + 1}</td>
                        <td className="p-4 font-medium text-text-primary">{candidate.name}</td>
                        <td className="p-4 text-text-secondary">{candidate.currentRole}</td>
                        <td className="p-4">
                          <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", stageBadge.bg, stageBadge.text)}>
                            {candidate.stage}
                          </span>
                        </td>
                        <td className="p-4 text-text-secondary">{candidate.location}</td>
                        <td className="p-4 text-text-secondary">{candidate.experience}</td>
                        <td className="p-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium",
                            getScoreBg(candidate.score),
                            getScoreColor(candidate.score)
                          )}>
                            {getFitLabel(candidate.score)}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingResume(candidate);
                            }}
                            className="px-3 py-1.5 rounded-md bg-purple/15 text-purple text-xs hover:bg-purple/25 transition-colors flex items-center gap-1.5"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            View
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${candidate.id}-expanded`}>
                          <td colSpan={9} className="p-0 bg-bg-glass border-b border-border-subtle">
                            <div className="px-14 py-4">
                              <Card className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <span className={cn(
                                    "px-3 py-1.5 rounded-full text-sm font-semibold",
                                    getScoreBg(candidate.score),
                                    getScoreColor(candidate.score)
                                  )}>
                                    {getFitLabel(candidate.score)} Fit
                                  </span>
                                  <span className="text-sm text-text-muted">Score: {candidate.score}/100</span>
                                </div>
                                <p className="text-sm text-text-primary leading-relaxed">{candidate.reason}</p>
                              </Card>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Resume Modal */}
      {viewingResume && (
        <ResumeModal candidate={viewingResume} onClose={() => setViewingResume(null)} />
      )}
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  );
}

