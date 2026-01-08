"use client";

import { useState } from "react";
import { View, Job } from "@/lib/types";
import { mockJobs } from "@/lib/mock-data";
import { AuthView, OnboardingView } from "@/components/auth";
import { JobsView } from "@/components/jobs";
import { ChatView } from "@/components/chat";
import { ResultsView } from "@/components/results";

export default function Home() {
  const [view, setView] = useState<View>("auth");
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Auth View
  if (view === "auth") {
    return <AuthView onAuth={() => setView("onboarding")} />;
  }

  // Onboarding View
  if (view === "onboarding") {
    return (
      <OnboardingView
        onComplete={() => setView("jobs")}
        onBack={() => setView("auth")}
      />
    );
  }

  // Jobs View
  if (view === "jobs") {
    return (
      <JobsView
        jobs={jobs}
        onJobsChange={setJobs}
        onSelectJob={(job) => {
          setSelectedJob(job);
          setView("chat");
        }}
      />
    );
  }

  // Chat View
  if (view === "chat" && selectedJob) {
    return (
      <ChatView
        job={selectedJob}
        onBack={() => setView("jobs")}
        onRunComplete={() => setView("results")}
      />
    );
  }

  // Results View
  if (view === "results" && selectedJob) {
    return (
      <ResultsView
        job={selectedJob}
        onBack={() => setView("chat")}
        onBackToJobs={() => {
          setSelectedJob(null);
          setView("jobs");
        }}
      />
    );
  }

  // Fallback
  return null;
}
