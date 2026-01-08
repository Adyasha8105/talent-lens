"use client";

import { useState } from "react";
import { Job } from "@/lib/types";
import { Input } from "@/components/ui";
import { JobCard } from "./job-card";
import { JobConfigPanel } from "./job-config-panel";

interface JobsViewProps {
  jobs: Job[];
  onJobsChange: (jobs: Job[]) => void;
  onSelectJob: (job: Job) => void;
}

export function JobsView({ jobs, onJobsChange, onSelectJob }: JobsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Open" | "Closed">("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.reqId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSyncModeChange = (mode: Job["syncMode"]) => {
    if (!selectedJob) return;
    const updated = jobs.map((j) =>
      j.id === selectedJob.id ? { ...j, syncMode: mode, syncStages: mode === "specific" ? j.syncStages : [] } : j
    );
    onJobsChange(updated);
    setSelectedJob({ ...selectedJob, syncMode: mode, syncStages: mode === "specific" ? selectedJob.syncStages : [] });
  };

  const handleStageToggle = (stage: string) => {
    if (!selectedJob) return;
    const newStages = selectedJob.syncStages.includes(stage)
      ? selectedJob.syncStages.filter((s) => s !== stage)
      : [...selectedJob.syncStages, stage];
    const updated = jobs.map((j) =>
      j.id === selectedJob.id ? { ...j, syncStages: newStages } : j
    );
    onJobsChange(updated);
    setSelectedJob({ ...selectedJob, syncStages: newStages });
  };

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Main Content */}
      <div className="flex-1 p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-1">Jobs</h1>
          <p className="text-text-secondary">Configure sync settings and filter candidates</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<SearchIcon />}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="bg-bg-tertiary border border-border-subtle rounded-lg px-4 py-2 text-sm text-text-primary cursor-pointer"
          >
            <option value="all">All statuses</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* Job List */}
        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSelected={selectedJob?.id === job.id}
              onClick={() => setSelectedJob(job)}
            />
          ))}
        </div>
      </div>

      {/* Config Panel */}
      {selectedJob && (
        <JobConfigPanel
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onFilterCandidates={() => onSelectJob(selectedJob)}
          onSyncModeChange={handleSyncModeChange}
          onStageToggle={handleStageToggle}
        />
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
}

