export type View = "auth" | "onboarding" | "jobs" | "chat" | "results";

export interface Job {
  id: string;
  title: string;
  location: string;
  workType: string;
  reqId: string;
  status: "Open" | "Closed";
  candidateCount: number;
  lastSync: string;
  syncMode: "all" | "specific" | "none";
  syncStages: string[];
}

export interface Candidate {
  id: string;
  name: string;
  currentRole: string;
  stage: string;
  location: string;
  experience: string;
  skills: string[];
  leadership: string;
  background: string;
  score: number;
  reason: string;
  email?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface Criterion {
  id: string;
  type: string;
  value: string;
}

export interface User {
  name: string;
  email: string;
  avatar?: string;
}

