"use client";

import { useState, useRef, useEffect } from "react";

// Types
type View = "auth" | "onboarding" | "jobs" | "chat" | "results";

interface Job {
  id: string;
  title: string;
  location: string;
  workType: "Remote" | "Hybrid" | "Onsite";
  reqId: string;
  status: "Open" | "Closed";
  candidateCount: number;
  lastSync: string;
  syncMode: "all" | "specific" | "none";
  selectedStages: string[];
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Criterion {
  id: string;
  type: "experience" | "skills" | "location" | "background" | "leadership" | "education" | "availability";
  value: string;
}

interface Candidate {
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

// Mock Data
const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior Backend Engineer",
    location: "San Francisco, CA",
    workType: "Hybrid",
    reqId: "ENG-2024-001",
    status: "Open",
    candidateCount: 142,
    lastSync: "2 hours ago",
    syncMode: "all",
    selectedStages: [],
  },
  {
    id: "2",
    title: "Product Designer",
    location: "New York, NY",
    workType: "Remote",
    reqId: "DES-2024-003",
    status: "Open",
    candidateCount: 89,
    lastSync: "1 day ago",
    syncMode: "specific",
    selectedStages: ["Phone Screen", "Onsite", "Offer"],
  },
  {
    id: "3",
    title: "Engineering Manager",
    location: "Austin, TX",
    workType: "Onsite",
    reqId: "MGR-2024-002",
    status: "Open",
    candidateCount: 56,
    lastSync: "3 days ago",
    syncMode: "none",
    selectedStages: [],
  },
  {
    id: "4",
    title: "Data Scientist",
    location: "Seattle, WA",
    workType: "Remote",
    reqId: "DATA-2024-001",
    status: "Closed",
    candidateCount: 234,
    lastSync: "1 week ago",
    syncMode: "all",
    selectedStages: [],
  },
];

const mockCandidates: Candidate[] = [
  {
    id: "1",
    name: "Sarah Chen",
    currentRole: "Staff Engineer at Meta",
    stage: "Onsite",
    location: "San Francisco, CA",
    experience: "8 years",
    skills: ["Python", "Go", "Kubernetes", "System Design"],
    leadership: "Led team of 12",
    background: "Ex-Google, Stanford CS",
    score: 95,
    reason: "Exceptional match with strong technical skills, leadership experience at FAANG companies, and local to SF.",
    email: "sarah.chen@email.com",
  },
  {
    id: "2",
    name: "Marcus Johnson",
    currentRole: "Senior SWE at Stripe",
    stage: "Hired",
    location: "San Francisco, CA",
    experience: "6 years",
    skills: ["Python", "Java", "AWS", "Microservices"],
    leadership: "Tech lead for 8",
    background: "Ex-Amazon, Berkeley",
    score: 92,
    reason: "Strong technical background with payment systems expertise and proven leadership abilities.",
    email: "marcus.j@email.com",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    currentRole: "Backend Lead at Airbnb",
    stage: "Phone Screen",
    location: "Remote (Austin)",
    experience: "7 years",
    skills: ["Python", "Rust", "Docker", "PostgreSQL"],
    leadership: "Managed 5 engineers",
    background: "Ex-Uber, MIT",
    score: 87,
    reason: "Solid experience but remote location may require adjustment. Strong technical skills.",
    email: "emily.r@email.com",
  },
  {
    id: "4",
    name: "David Kim",
    currentRole: "SWE III at Microsoft",
    stage: "Offer",
    location: "Seattle, WA",
    experience: "5 years",
    skills: ["Python", "C#", "Azure", "TypeScript"],
    leadership: "Mentored 3 juniors",
    background: "Microsoft, UW",
    score: 78,
    reason: "Good skills but limited leadership experience. Would need relocation.",
    email: "david.kim@email.com",
  },
  {
    id: "5",
    name: "Jessica Park",
    currentRole: "Software Engineer at Coinbase",
    stage: "Phone Screen",
    location: "New York, NY",
    experience: "4 years",
    skills: ["Python", "JavaScript", "React", "Web3"],
    leadership: "Individual contributor",
    background: "Coinbase, NYU",
    score: 65,
    reason: "Developing skills but lacks senior-level experience and leadership background.",
    email: "jessica.p@email.com",
  },
  {
    id: "6",
    name: "Alex Thompson",
    currentRole: "Junior Developer at Startup",
    stage: "Rejected",
    location: "Chicago, IL",
    experience: "2 years",
    skills: ["Python", "SQL", "Django"],
    leadership: "None",
    background: "Bootcamp grad",
    score: 42,
    reason: "Insufficient experience for senior role. Would be better suited for mid-level position.",
    email: "alex.t@email.com",
  },
];

const stages = ["Phone Screen", "Onsite", "Offer", "Hired", "Rejected"];

const quickSuggestions = [
  "5+ years experience",
  "Strong Python skills",
  "FAANG background",
  "Leadership experience",
  "SF Bay Area",
];

// Helper functions
const parseJobTitle = (title: string): string[] => {
  const criteria: string[] = [];
  const lower = title.toLowerCase();
  
  if (lower.includes("senior") || lower.includes("staff") || lower.includes("principal")) {
    criteria.push("Senior-level candidate with 5+ years of experience");
  }
  if (lower.includes("backend") || lower.includes("back-end")) {
    criteria.push("Backend development experience");
  }
  if (lower.includes("frontend") || lower.includes("front-end")) {
    criteria.push("Frontend development skills");
  }
  if (lower.includes("fullstack") || lower.includes("full-stack")) {
    criteria.push("Full-stack development capabilities");
  }
  if (lower.includes("engineer")) {
    criteria.push("Software engineering background");
  }
  if (lower.includes("manager") || lower.includes("lead")) {
    criteria.push("Team leadership and management experience");
  }
  if (lower.includes("data")) {
    criteria.push("Data engineering or data science background");
  }
  
  return criteria;
};

const extractCriteriaFromText = (text: string, existingCriteria: Criterion[]): Criterion[] => {
  const newCriteria: Criterion[] = [];
  const lower = text.toLowerCase();
  const existingValues = existingCriteria.map(c => c.value.toLowerCase());
  
  const expMatch = text.match(/(\d+)\+?\s*years?/i);
  if (expMatch && !existingValues.some(v => v.includes("years"))) {
    newCriteria.push({
      id: crypto.randomUUID(),
      type: "experience",
      value: `${expMatch[1]}+ years of experience`,
    });
  }
  
  const skillKeywords = ["python", "java", "javascript", "typescript", "go", "rust", "kubernetes", "docker", "aws", "gcp", "react", "node", "sql", "nosql"];
  skillKeywords.forEach(skill => {
    if (lower.includes(skill) && !existingValues.some(v => v.toLowerCase().includes(skill))) {
      newCriteria.push({
        id: crypto.randomUUID(),
        type: "skills",
        value: skill.charAt(0).toUpperCase() + skill.slice(1),
      });
    }
  });
  
  if ((lower.includes("sf") || lower.includes("san francisco") || lower.includes("bay area")) && !existingValues.some(v => v.includes("Francisco") || v.includes("Bay"))) {
    newCriteria.push({ id: crypto.randomUUID(), type: "location", value: "Based in SF Bay Area" });
  }
  if (lower.includes("remote") && !existingValues.some(v => v.includes("remote"))) {
    newCriteria.push({ id: crypto.randomUUID(), type: "location", value: "Open to remote work" });
  }
  
  if ((lower.includes("faang") || lower.includes("big tech") || lower.includes("google") || lower.includes("meta") || lower.includes("amazon")) && !existingValues.some(v => v.includes("FAANG") || v.includes("tech"))) {
    newCriteria.push({ id: crypto.randomUUID(), type: "background", value: "FAANG or big tech experience preferred" });
  }
  if (lower.includes("startup") && !existingValues.some(v => v.includes("startup"))) {
    newCriteria.push({ id: crypto.randomUUID(), type: "background", value: "Startup experience valued" });
  }
  
  if ((lower.includes("lead") || lower.includes("manage") || lower.includes("leadership")) && !existingValues.some(v => v.includes("leadership") || v.includes("lead"))) {
    newCriteria.push({ id: crypto.randomUUID(), type: "leadership", value: "Team leadership experience" });
  }
  
  return newCriteria;
};

const getNextQuestion = (criteria: Criterion[], conversationLength: number): string => {
  const types = criteria.map(c => c.type);
  
  if (!types.includes("experience") && conversationLength < 3) {
    return "What level of experience are you looking for? (e.g., 5+ years, senior level)";
  }
  if (!types.includes("skills") && conversationLength < 5) {
    return "Are there any specific technical skills or technologies they should have?";
  }
  if (!types.includes("location") && conversationLength < 7) {
    return "Any location preferences? Remote, specific cities, or timezone requirements?";
  }
  if (!types.includes("background") && conversationLength < 9) {
    return "What kind of company background would be ideal? FAANG, startups, specific industries?";
  }
  if (!types.includes("leadership") && conversationLength < 11) {
    return "Is leadership or management experience important for this role?";
  }
  
  return "Got it! Add more criteria or verify the generated prompt on the right and run.";
};

const generatePrompt = (jobTitle: string, criteria: Criterion[]): string => {
  const grouped: Record<string, string[]> = {};
  criteria.forEach(c => {
    if (!grouped[c.type]) grouped[c.type] = [];
    grouped[c.type].push(c.value);
  });
  
  const jobImplicit = parseJobTitle(jobTitle);
  
  let prompt = `Evaluate candidates for: ${jobTitle}\n\n`;
  prompt += `## Role Context\n`;
  jobImplicit.forEach(imp => { prompt += `• ${imp}\n`; });
  prompt += `\n## Criteria\n\n`;
  
  if (grouped.experience?.length) {
    prompt += `Experience:\n`;
    grouped.experience.forEach(e => { prompt += `• ${e}\n`; });
  }
  if (grouped.skills?.length) {
    prompt += `\nTechnical Skills:\n`;
    grouped.skills.forEach(s => { prompt += `• ${s}\n`; });
  }
  if (grouped.location?.length) {
    prompt += `\nLocation:\n`;
    grouped.location.forEach(l => { prompt += `• ${l}\n`; });
  }
  if (grouped.background?.length) {
    prompt += `\nBackground:\n`;
    grouped.background.forEach(b => { prompt += `• ${b}\n`; });
  }
  if (grouped.leadership?.length) {
    prompt += `\nLeadership:\n`;
    grouped.leadership.forEach(l => { prompt += `• ${l}\n`; });
  }
  
  prompt += `\n## Scoring\n`;
  prompt += `• 90-100: Excellent match\n`;
  prompt += `• 75-89: Strong match\n`;
  prompt += `• 60-74: Potential match\n`;
  prompt += `• Below 60: Weak match\n`;
  
  return prompt;
};

// Icon Components
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const SlackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
  </svg>
);

const LockIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="M21 21l-4.35-4.35"/>
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const Spinner = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeOpacity="0.2" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const TypingIndicator = () => (
  <div style={{ display: "flex", gap: "6px", alignItems: "center", padding: "4px 0" }}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: "var(--accent-primary)",
          animation: "bounce 1.4s infinite ease-in-out",
          animationDelay: `${i * 0.16}s`,
          opacity: 0.7,
        }}
      />
    ))}
  </div>
);

// Main Component
export default function Home() {
  const [view, setView] = useState<View>("auth");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<"google" | "slack" | null>(null);
  const [userName, setUserName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Open" | "Closed">("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [scoreFilter, setScoreFilter] = useState<"all" | "excellent" | "strong" | "potential" | "weak">("all");
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
  const [configuringJob, setConfiguringJob] = useState<Job | null>(null);
  const [sampleResults, setSampleResults] = useState<Candidate[] | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [viewingResume, setViewingResume] = useState<Candidate | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut to close sample results drawer (Escape key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && sampleResults) {
        setSampleResults(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sampleResults]);

  const candidateStages = ["Phone Screen", "Onsite", "Offer", "Hired", "Rejected"];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleOAuthLogin = (provider: "google" | "slack") => {
    setIsLoading(true);
    setLoadingProvider(provider);
    setTimeout(() => {
      setUserName(provider === "google" ? "Alex" : "Jordan");
      setIsLoading(false);
      setLoadingProvider(null);
      setView("onboarding");
    }, 1500);
  };

  const handleConnectGreenhouse = () => {
    if (apiKey.length < 8) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setView("jobs");
    }, 2000);
  };

  const handleJobSyncChange = (jobId: string, mode: "all" | "specific" | "none") => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, syncMode: mode } : j));
    setConfiguringJob(prev => prev?.id === jobId ? { ...prev, syncMode: mode } : prev);
    setHasChanges(true);
  };

  const handleStageChange = (jobId: string, stage: string, checked: boolean) => {
    const updateStages = (j: Job) => {
      const newStages = checked 
        ? [...j.selectedStages, stage]
        : j.selectedStages.filter(s => s !== stage);
      return { ...j, selectedStages: newStages };
    };
    setJobs(prev => prev.map(j => j.id === jobId ? updateStages(j) : j));
    setConfiguringJob(prev => prev?.id === jobId ? updateStages(prev) : prev);
    setHasChanges(true);
  };

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setCriteria([]);
    setGeneratedPrompt("");
    setMessages([
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Let's build the ideal candidate criteria for **${job.title}**.\n\nWhat experience, skills, or background are you looking for?`,
      },
    ]);
    setView("chat");
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedJob) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: inputText.trim(),
    };
    setMessages(prev => [...prev, userMessage]);
    const userInput = inputText.trim().toLowerCase();
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      let assistantContent = "";
      let newCriteria: Criterion[] = [];

      if (userInput === "done" || userInput.includes("that's all") || userInput.includes("generate") || userInput.includes("finish")) {
        const prompt = generatePrompt(selectedJob.title, criteria);
        setGeneratedPrompt(prompt);
        assistantContent = `I've compiled **${criteria.length} criteria** into your prompt.\n\nReview it on the right, then click **Run** to score your candidates.`;
      } else {
        if (["yes", "yeah", "sure", "definitely", "absolutely", "yep"].includes(userInput)) {
          const lastAssistant = messages.filter(m => m.role === "assistant").pop();
          if (lastAssistant) {
            if (lastAssistant.content.toLowerCase().includes("leadership")) {
              newCriteria.push({ id: crypto.randomUUID(), type: "leadership", value: "Leadership experience required" });
            } else if (lastAssistant.content.toLowerCase().includes("location")) {
              newCriteria.push({ id: crypto.randomUUID(), type: "location", value: "Location flexibility preferred" });
            } else if (lastAssistant.content.toLowerCase().includes("remote")) {
              newCriteria.push({ id: crypto.randomUUID(), type: "location", value: "Open to remote candidates" });
            }
          }
        } else {
          newCriteria = extractCriteriaFromText(inputText, criteria);
        }

        if (newCriteria.length > 0) {
          setCriteria(prev => [...prev, ...newCriteria]);
          setSampleResults(null); // Reset sample when criteria change
          assistantContent = `Added: ${newCriteria.map(c => `**${c.value}**`).join(", ")}\n\n${getNextQuestion([...criteria, ...newCriteria], messages.length)}`;
        } else {
          assistantContent = getNextQuestion(criteria, messages.length);
        }
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: assistantContent,
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInputText(suggestion);
    setTimeout(() => {
      const input = chatInputRef.current;
      if (input) {
        input.focus();
        input.setSelectionRange(suggestion.length, suggestion.length);
      }
    }, 0);
  };

  const handleTestSample = () => {
    setIsTesting(true);
    setTimeout(() => {
      // Get first 5 candidates as sample
      const sample = [...mockCandidates].sort((a, b) => b.score - a.score).slice(0, 5);
      setSampleResults(sample);
      setIsTesting(false);
    }, 1500);
  };

  const handleRunCandidates = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setSampleResults(null);
      setScoreFilter("all");
      setExpandedCandidate(null);
      setView("results");
    }, 2000);
  };

  const removeCriterion = (id: string) => {
    setCriteria(prev => prev.filter(c => c.id !== id));
  };

  const getCriteriaTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      experience: { bg: "rgba(245, 158, 11, 0.15)", text: "var(--accent-warning)" },
      skills: { bg: "rgba(19, 129, 58, 0.15)", text: "var(--accent-primary)" },
      location: { bg: "rgba(16, 185, 129, 0.15)", text: "var(--accent-success)" },
      background: { bg: "rgba(139, 92, 246, 0.15)", text: "var(--accent-secondary)" },
      leadership: { bg: "rgba(244, 114, 182, 0.15)", text: "var(--accent-tertiary)" },
      education: { bg: "rgba(99, 102, 241, 0.15)", text: "#818cf8" },
      availability: { bg: "rgba(34, 197, 94, 0.15)", text: "#22c55e" },
    };
    return colors[type] || { bg: "var(--bg-glass)", text: "var(--text-secondary)" };
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.reqId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return "var(--accent-success)";
    if (score >= 75) return "var(--accent-primary)";
    if (score >= 60) return "var(--accent-warning)";
    return "var(--accent-error)";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "rgba(16, 185, 129, 0.15)";
    if (score >= 75) return "rgba(19, 129, 58, 0.15)";
    if (score >= 60) return "rgba(245, 158, 11, 0.15)";
    return "rgba(239, 68, 68, 0.15)";
  };

  const getStageBadge = (stage: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      "Offer": { bg: "rgba(16, 185, 129, 0.15)", text: "var(--accent-success)" },
      "Onsite": { bg: "rgba(19, 129, 58, 0.15)", text: "var(--accent-primary)" },
      "Phone Screen": { bg: "rgba(139, 92, 246, 0.15)", text: "var(--accent-secondary)" },
      "Hired": { bg: "rgba(16, 185, 129, 0.15)", text: "var(--accent-success)" },
      "Rejected": { bg: "rgba(239, 68, 68, 0.15)", text: "var(--accent-error)" },
    };
    return colors[stage] || { bg: "var(--bg-glass)", text: "var(--text-secondary)" };
  };

  // Shared Styles
  const glassCardStyle: React.CSSProperties = {
    background: "var(--bg-card)",
    backdropFilter: "blur(20px)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-lg)",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-default)",
    fontSize: "15px",
    background: "var(--bg-glass)",
    color: "var(--text-primary)",
    transition: "var(--transition-normal)",
  };

  const primaryButtonStyle: React.CSSProperties = {
    padding: "14px 28px",
    borderRadius: "var(--radius-md)",
    fontSize: "15px",
    fontWeight: 600,
    background: "var(--gradient-primary)",
    color: "white",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "var(--transition-normal)",
    boxShadow: "0 4px 20px rgba(19, 129, 58, 0.3)",
  };

  // Auth View
  if (view === "auth") {
  return (
      <div style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        backgroundImage: "var(--gradient-mesh)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}>
        <div style={{
          ...glassCardStyle,
          padding: "48px",
          width: "100%",
          maxWidth: "420px",
          animation: "scaleIn 0.5s ease",
        }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h1 style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "8px",
              letterSpacing: "-0.5px",
            }}>
              Skill Grep
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
              AI-powered candidate filtering
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button
              onClick={() => handleOAuthLogin("google")}
              disabled={isLoading}
              style={{
                ...glassCardStyle,
                padding: "14px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                cursor: isLoading ? "wait" : "pointer",
                opacity: isLoading ? 0.7 : 1,
                color: "var(--text-primary)",
                fontSize: "15px",
                fontWeight: 500,
                transition: "var(--transition-normal)",
              }}
            >
              {loadingProvider === "google" ? <Spinner size={20} /> : <GoogleIcon />}
              Continue with Google
            </button>

            <button
              onClick={() => handleOAuthLogin("slack")}
              disabled={isLoading}
              style={{
                padding: "14px 24px",
                borderRadius: "var(--radius-lg)",
                background: "var(--gradient-secondary)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                cursor: isLoading ? "wait" : "pointer",
                opacity: isLoading ? 0.7 : 1,
                color: "white",
                fontSize: "15px",
                fontWeight: 500,
                transition: "var(--transition-normal)",
                boxShadow: "0 4px 20px rgba(139, 92, 246, 0.3)",
              }}
            >
              {loadingProvider === "slack" ? <Spinner size={20} /> : <SlackIcon />}
              Continue with Slack
            </button>
          </div>

          <p style={{
            textAlign: "center",
            fontSize: "12px",
            color: "var(--text-muted)",
            marginTop: "32px",
            lineHeight: 1.6,
          }}>
            By continuing, you agree to our Terms and Privacy Policy
          </p>
        </div>
      </div>
    );
  }

  // Onboarding View
  if (view === "onboarding") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        backgroundImage: "var(--gradient-mesh)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}>
        <div style={{
          ...glassCardStyle,
          padding: "48px",
          width: "100%",
          maxWidth: "480px",
          animation: "slideUp 0.5s ease",
        }}>
          <button
            onClick={() => setView("auth")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--text-secondary)",
              background: "none",
              border: "none",
              fontSize: "14px",
              marginBottom: "32px",
              cursor: "pointer",
              padding: "8px 12px",
              marginLeft: "-12px",
              borderRadius: "var(--radius-sm)",
              transition: "var(--transition-fast)",
            }}
          >
            <BackIcon /> Back
          </button>

          <div style={{ marginBottom: "32px" }}>
            <h1 style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: "8px",
            }}>
              Connect your ATS
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              We need API access to pull your job listings and candidates.
            </p>
          </div>

          <div style={{
            background: "var(--bg-glass)",
            borderRadius: "var(--radius-md)",
            padding: "14px 16px",
            marginBottom: "24px",
            border: "1px solid var(--border-subtle)",
            fontSize: "13px",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
          }}>
            You can find your API key in your ATS settings, usually under <strong style={{ color: "var(--text-primary)" }}>Integrations</strong> or <strong style={{ color: "var(--text-primary)" }}>Developer Settings</strong>.
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--text-primary)",
              marginBottom: "8px",
            }}>
              API Key
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                style={{ ...inputStyle, paddingRight: "48px" }}
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <EyeIcon open={showApiKey} />
              </button>
            </div>
          </div>

          <button
            onClick={handleConnectGreenhouse}
            disabled={apiKey.length < 8 || isLoading}
            style={{
              ...primaryButtonStyle,
              width: "100%",
              opacity: apiKey.length < 8 ? 0.5 : 1,
              cursor: apiKey.length < 8 ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? <Spinner size={20} /> : null}
            {isLoading ? "Connecting..." : "Connect"}
          </button>
        </div>
      </div>
    );
  }

  // Jobs List View
  if (view === "jobs") {
    const getSyncColor = (mode: string) => {
      if (mode === "all") return "var(--accent-success)";
      if (mode === "specific") return "var(--accent-primary)";
      return "var(--text-muted)";
    };

    return (
      <div style={{
        height: "100vh",
        background: "var(--bg-primary)",
        display: "grid",
        gridTemplateColumns: configuringJob ? "1fr 380px" : "1fr",
        overflow: "hidden",
      }}>
        {/* Left - Jobs List */}
        <div style={{ overflow: "auto", padding: "32px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ marginBottom: "24px" }}>
              <h1 style={{
                fontSize: "24px",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: "4px",
              }}>
                Jobs
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                Configure sync settings and filter candidates
          </p>
        </div>

            {/* Search & Filter */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
              <div style={{ position: "relative", flex: 1, maxWidth: "320px" }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jobs..."
                  style={{ ...inputStyle, paddingLeft: "40px" }}
                />
                <div style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}>
                  <SearchIcon />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "Open" | "Closed")}
                style={{
                  ...inputStyle,
                  width: "140px",
                  cursor: "pointer",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  paddingRight: "36px",
                }}
              >
                <option value="all">All statuses</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Jobs Grid */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  style={{
                    ...glassCardStyle,
                    padding: "16px 20px",
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto auto",
                    gap: "16px",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "var(--transition-fast)",
                    borderColor: configuringJob?.id === job.id ? "var(--accent-primary)" : "var(--border-default)",
                    background: configuringJob?.id === job.id ? "var(--bg-card-hover)" : "var(--bg-card)",
                  }}
                  onClick={() => setConfiguringJob(configuringJob?.id === job.id ? null : job)}
                  onMouseEnter={(e) => {
                    if (configuringJob?.id !== job.id) {
                      e.currentTarget.style.background = "var(--bg-card-hover)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (configuringJob?.id !== job.id) {
                      e.currentTarget.style.background = "var(--bg-card)";
                    }
                  }}
                >
                  {/* Sync Status Indicator */}
                  <div style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: getSyncColor(job.syncMode),
                  }} />

                  {/* Job Info */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-primary)" }}>
                        {job.title}
                      </h3>
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: "var(--radius-full)",
                        background: job.status === "Open" ? "rgba(34, 197, 94, 0.15)" : "rgba(100, 116, 139, 0.15)",
                        color: job.status === "Open" ? "var(--accent-success)" : "var(--text-tertiary)",
                        fontSize: "11px",
                        fontWeight: 500,
                      }}>
                        {job.status}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "var(--text-tertiary)" }}>
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.workType}</span>
                      <span>•</span>
                      <span>{job.reqId}</span>
                    </div>
                  </div>

                  {/* Candidate Count & Sync Info */}
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>
                      {job.candidateCount} candidates
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                      {job.syncMode === "all" ? "All synced" : job.syncMode === "specific" ? `${job.selectedStages.length} stages` : "Not syncing"}
                    </div>
                  </div>

                  {/* Last Sync */}
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", minWidth: "80px", textAlign: "right" }}>
                    {job.lastSync}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Sync Configuration Panel */}
        {configuringJob && (
          <div style={{
            borderLeft: "1px solid var(--border-default)",
            background: "var(--bg-secondary)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}>
            {/* Panel Header */}
            <div style={{
              padding: "20px",
              borderBottom: "1px solid var(--border-default)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>
                  {configuringJob.title}
                </h2>
                <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
                  {configuringJob.reqId}
                </p>
              </div>
              <button
                onClick={() => setConfiguringJob(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Sync Settings */}
            <div style={{ flex: 1, overflow: "auto", padding: "20px" }}>
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "12px" }}>
                  Candidate Sync
                </h3>
                
                {/* Radio Options */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "12px",
                    borderRadius: "var(--radius-sm)",
                    background: configuringJob.syncMode === "all" ? "rgba(19, 129, 58, 0.1)" : "transparent",
                    border: `1px solid ${configuringJob.syncMode === "all" ? "var(--accent-primary)" : "var(--border-default)"}`,
                    cursor: "pointer",
                    transition: "var(--transition-fast)",
                  }}>
                    <input
                      type="radio"
                      name="syncMode"
                      checked={configuringJob.syncMode === "all"}
                      onChange={() => handleJobSyncChange(configuringJob.id, "all")}
                      style={{ marginTop: "2px", accentColor: "var(--accent-primary)" }}
                    />
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>
                        All candidates
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>
                        Sync all candidates regardless of stage
                      </div>
                    </div>
                  </label>

                  <label style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "12px",
                    borderRadius: "var(--radius-sm)",
                    background: configuringJob.syncMode === "specific" ? "rgba(19, 129, 58, 0.1)" : "transparent",
                    border: `1px solid ${configuringJob.syncMode === "specific" ? "var(--accent-primary)" : "var(--border-default)"}`,
                    cursor: "pointer",
                    transition: "var(--transition-fast)",
                  }}>
                    <input
                      type="radio"
                      name="syncMode"
                      checked={configuringJob.syncMode === "specific"}
                      onChange={() => handleJobSyncChange(configuringJob.id, "specific")}
                      style={{ marginTop: "2px", accentColor: "var(--accent-primary)" }}
                    />
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>
                        Specific stages only
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>
                        Only sync candidates in selected stages
                      </div>
                    </div>
                  </label>

                  <label style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "12px",
                    borderRadius: "var(--radius-sm)",
                    background: configuringJob.syncMode === "none" ? "rgba(100, 116, 139, 0.1)" : "transparent",
                    border: `1px solid ${configuringJob.syncMode === "none" ? "var(--text-muted)" : "var(--border-default)"}`,
                    cursor: "pointer",
                    transition: "var(--transition-fast)",
                  }}>
                    <input
                      type="radio"
                      name="syncMode"
                      checked={configuringJob.syncMode === "none"}
                      onChange={() => handleJobSyncChange(configuringJob.id, "none")}
                      style={{ marginTop: "2px", accentColor: "var(--text-muted)" }}
                    />
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>
                        Don&apos;t sync
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>
                        Skip this job when syncing
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Stage Checkboxes - Only show when specific is selected */}
              {configuringJob.syncMode === "specific" && (
                <div style={{ marginBottom: "24px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "12px" }}>
                    Select Stages
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {candidateStages.map((stage) => (
                      <label
                        key={stage}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px 12px",
                          borderRadius: "var(--radius-sm)",
                          background: configuringJob.selectedStages.includes(stage) ? "rgba(19, 129, 58, 0.08)" : "var(--bg-glass)",
                          border: `1px solid ${configuringJob.selectedStages.includes(stage) ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                          cursor: "pointer",
                          transition: "var(--transition-fast)",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={configuringJob.selectedStages.includes(stage)}
                          onChange={(e) => handleStageChange(configuringJob.id, stage, e.target.checked)}
                          style={{ accentColor: "var(--accent-primary)" }}
                        />
                        <span style={{ fontSize: "14px", color: "var(--text-primary)" }}>{stage}</span>
                      </label>
                    ))}
        </div>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "12px" }}>
                    Only candidates in the selected stages will be synced and available for filtering.
                  </p>
                </div>
              )}

              {/* Last Sync Info */}
              <div style={{
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                background: "var(--bg-glass)",
                border: "1px solid var(--border-subtle)",
              }}>
                <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "4px" }}>
                  Last synced
                </div>
                <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  {configuringJob.lastSync}
                </div>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    padding: "0",
                    marginTop: "8px",
                    fontSize: "13px",
                    color: "var(--accent-primary)",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  View sync log
                </button>
              </div>
            </div>

            {/* Filter Button */}
            <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border-default)" }}>
              <button
                onClick={() => handleSelectJob(configuringJob)}
                style={{
                  ...primaryButtonStyle,
                  width: "100%",
                }}
              >
                Filter Candidates
              </button>
            </div>
          </div>
        )}

        {/* Save Changes Bar */}
        {hasChanges && (
          <div style={{
            position: "fixed",
            bottom: "24px",
            left: configuringJob ? "calc(50% - 190px)" : "50%",
            transform: "translateX(-50%)",
            background: "var(--bg-card)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            padding: "12px 20px",
            display: "flex",
            gap: "12px",
            boxShadow: "var(--shadow-lg)",
            animation: "slideUp 0.3s ease",
          }}>
            <button
              onClick={() => {
                setJobs(mockJobs);
                setHasChanges(false);
                setConfiguringJob(null);
              }}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-sm)",
                background: "transparent",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Discard
            </button>
            <button
              onClick={() => setHasChanges(false)}
              style={{
                ...primaryButtonStyle,
                padding: "8px 16px",
              }}
            >
              Save changes
            </button>
          </div>
        )}
    </div>
  );
  }

  // Chat View - ChatGPT-style interface with sliding prompt panel
  if (view === "chat" && selectedJob) {
    const showPromptPanel = criteria.length > 0;
    
    return (
      <>
      <div style={{
        height: "100vh",
        background: "#0a0a0a",
        display: "flex",
        overflow: "hidden",
      }}>
        {/* Main Chat Area */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "all 0.3s ease",
        }}>
          {/* Minimal Header */}
          <div style={{
            padding: "12px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={() => setView("jobs")}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "8px",
                  cursor: "pointer",
                  color: "var(--text-tertiary)",
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "6px",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <BackIcon />
              </button>
              <div style={{
                padding: "6px 12px",
                background: "rgba(19, 129, 58, 0.15)",
                borderRadius: "20px",
                fontSize: "13px",
                color: "var(--accent-primary)",
                fontWeight: 500,
              }}>
                {selectedJob.title}
              </div>
            </div>
            <span style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
              {selectedJob.candidateCount} candidates
            </span>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{
              maxWidth: "720px",
              width: "100%",
              margin: "0 auto",
              padding: "32px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: "flex",
                    justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                    animation: "fadeIn 0.3s ease",
                  }}
                >
                  <div style={{
                    maxWidth: "85%",
                    padding: "14px 18px",
                    borderRadius: message.role === "user" 
                      ? "18px 18px 4px 18px" 
                      : "18px 18px 18px 4px",
                    background: message.role === "user" 
                      ? "var(--accent-primary)"
                      : "rgba(255,255,255,0.05)",
                    color: message.role === "user" ? "white" : "var(--text-primary)",
                    fontSize: "15px",
                    lineHeight: 1.6,
                  }}>
                    <span dangerouslySetInnerHTML={{
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br/>')
                    }} />
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div style={{ display: "flex", justifyContent: "flex-start", animation: "fadeIn 0.3s ease" }}>
                  <div style={{
                    padding: "14px 18px",
                    borderRadius: "18px 18px 18px 4px",
                    background: "rgba(255,255,255,0.05)",
                  }}>
                    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                      <div style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "var(--text-tertiary)",
                        animation: "bounce 1.4s ease-in-out infinite",
                      }} />
                      <div style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "var(--text-tertiary)",
                        animation: "bounce 1.4s ease-in-out 0.2s infinite",
                      }} />
                      <div style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "var(--text-tertiary)",
                        animation: "bounce 1.4s ease-in-out 0.4s infinite",
                      }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Suggestions - Card style */}
          {messages.length === 1 && (
            <div style={{
              maxWidth: "720px",
              width: "100%",
              margin: "0 auto",
              padding: "0 24px 16px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
              flexShrink: 0,
            }}>
              {quickSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleQuickSuggestion(suggestion)}
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div style={{
            padding: "16px 24px 24px",
            flexShrink: 0,
          }}>
            <div style={{
              maxWidth: "720px",
              margin: "0 auto",
            }}>
              <div style={{
                display: "flex",
                alignItems: "flex-end",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "4px",
              }}>
                <input
                  ref={chatInputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Describe your ideal candidate..."
                  style={{
                    flex: 1,
                    padding: "14px 16px",
                    background: "transparent",
                    border: "none",
                    fontSize: "15px",
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isTyping}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: inputText.trim() && !isTyping ? "var(--accent-primary)" : "transparent",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: !inputText.trim() || isTyping ? "default" : "pointer",
                    color: inputText.trim() && !isTyping ? "white" : "var(--text-muted)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Slides in when criteria exist */}
        <div style={{
          width: showPromptPanel ? "380px" : "0px",
          borderLeft: showPromptPanel ? "1px solid rgba(255,255,255,0.06)" : "none",
          background: "#111",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "all 0.3s ease",
        }}>
          {showPromptPanel && (
            <>
              {/* Panel Header */}
              <div style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                  Generated Prompt
                </h3>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Editable
                </span>
              </div>

              {/* Criteria Tags */}
              {/* <div style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                flexShrink: 0,
              }}>
                <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "10px" }}>
                  Criteria ({criteria.length})
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {criteria.map((c) => (
                    <span
                      key={c.id}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "6px",
                        background: "rgba(19, 129, 58, 0.15)",
                        fontSize: "12px",
                        color: "var(--accent-primary)",
                      }}
                    >
                      {c.value}
                    </span>
                  ))}
                </div>
              </div> */}

              {/* Prompt Textarea */}
              <div style={{ flex: 1, padding: "16px 20px", overflow: "auto" }}>
                <textarea
                  value={generatedPrompt || generatePrompt(selectedJob.title, criteria)}
                  onChange={(e) => {
                    setGeneratedPrompt(e.target.value);
                    setSampleResults(null);
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    minHeight: "200px",
                    padding: "14px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.03)",
                    fontSize: "13px",
                    fontFamily: "var(--font-mono)",
                    lineHeight: 1.6,
                    resize: "none",
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{
                padding: "16px 20px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}>
                <button
                  onClick={handleTestSample}
                  disabled={isTesting}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    cursor: isTesting ? "wait" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.15s ease",
                  }}
                >
                  {isTesting ? <Spinner size={14} /> : null}
                  {isTesting ? "Testing..." : "Test on 5 candidates"}
                </button>
                
                <button
                  onClick={handleRunCandidates}
                  disabled={isRunning || !sampleResults}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    background: sampleResults ? "var(--accent-primary)" : "rgba(255,255,255,0.03)",
                    border: "none",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: sampleResults ? "white" : "var(--text-muted)",
                    cursor: isRunning || !sampleResults ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.15s ease",
                  }}
                >
                  {isRunning ? <Spinner size={14} /> : null}
                  {isRunning ? "Analyzing..." : `Run on all ${selectedJob.candidateCount}`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Drawer - Sample Results Preview */}
      {sampleResults && (
        <div style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#111",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          boxShadow: "0 -8px 32px rgba(0,0,0,0.5)",
          animation: "slideUp 0.3s ease",
          zIndex: 100,
          maxHeight: "60vh",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Drawer Header with Close */}
          <div style={{
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={() => setSampleResults(null)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                }}
                title="Close & Edit Prompt"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>
                Sample Results
              </h3>
              <span style={{
                padding: "4px 10px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: 500,
                background: "rgba(34, 197, 94, 0.15)",
                color: "#22c55e",
              }}>
                {sampleResults.length} candidates
              </span>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                Press <kbd style={{ padding: "2px 6px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", fontSize: "11px" }}>Esc</kbd> to close
              </span>
              <button
                onClick={() => setSampleResults(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                Edit Prompt
              </button>
              <button
                onClick={handleRunCandidates}
                disabled={isRunning}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  background: "var(--accent-primary)",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "white",
                  cursor: isRunning ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {isRunning ? <Spinner size={14} /> : null}
                Run on all {selectedJob.candidateCount}
              </button>
            </div>
          </div>

          {/* Sample Results Table */}
          <div style={{ flex: 1, overflow: "auto", padding: "0 24px 16px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px", width: "180px" }}>Candidate</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px", width: "80px" }}>Fit</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Reasoning</th>
                  <th style={{ textAlign: "center", padding: "12px 16px", fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px", width: "80px" }}>Resume</th>
                </tr>
              </thead>
              <tbody>
                {sampleResults.map((candidate) => (
                  <tr key={candidate.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "14px 16px", verticalAlign: "top" }}>
                      <div style={{ fontWeight: 500, color: "var(--text-primary)", fontSize: "14px" }}>{candidate.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>{candidate.currentRole}</div>
                    </td>
                    <td style={{ padding: "14px 16px", verticalAlign: "top" }}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: 500,
                        background: candidate.score >= 90 ? "rgba(34, 197, 94, 0.15)" : candidate.score >= 75 ? "rgba(19, 129, 58, 0.15)" : candidate.score >= 60 ? "rgba(234, 179, 8, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: getScoreColor(candidate.score),
                      }}>
                        {candidate.score >= 90 ? "Strong" : candidate.score >= 75 ? "Good" : candidate.score >= 60 ? "Moderate" : "Review"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", verticalAlign: "top" }}>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                        {candidate.reason}
                      </p>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center", verticalAlign: "top" }}>
                      <button
                        onClick={() => setViewingResume(candidate)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          background: "rgba(139, 92, 246, 0.15)",
                          border: "none",
                          fontSize: "12px",
                          color: "#8b5cf6",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
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
      )}

      {/* Resume Modal */}
      {viewingResume && (
        <div 
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setViewingResume(null)}
        >
          <div 
            style={{
              width: "90%",
              maxWidth: "800px",
              maxHeight: "85vh",
              background: "#1a1a1a",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              flexDirection: "column",
              animation: "scaleIn 0.2s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: "20px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                  {viewingResume.name}
                </h3>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  {viewingResume.currentRole} • {viewingResume.experience}
                </p>
              </div>
              <button
                onClick={() => setViewingResume(null)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* AI Assessment Banner */}
            <div style={{
              padding: "16px 24px",
              background: viewingResume.score >= 75 ? "rgba(34, 197, 94, 0.08)" : "rgba(234, 179, 8, 0.08)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <span style={{
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  background: viewingResume.score >= 90 ? "rgba(34, 197, 94, 0.2)" : viewingResume.score >= 75 ? "rgba(19, 129, 58, 0.2)" : viewingResume.score >= 60 ? "rgba(234, 179, 8, 0.2)" : "rgba(239, 68, 68, 0.2)",
                  color: getScoreColor(viewingResume.score),
                }}>
                  {viewingResume.score >= 90 ? "Strong Fit" : viewingResume.score >= 75 ? "Good Fit" : viewingResume.score >= 60 ? "Moderate Fit" : "Needs Review"}
                </span>
                <span style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>AI Assessment</span>
              </div>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                {viewingResume.reason}
              </p>
            </div>

            {/* Resume Content */}
            <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
              <div style={{ 
                background: "white", 
                borderRadius: "8px", 
                padding: "32px",
                color: "#1a1a1a",
                fontSize: "14px",
                lineHeight: 1.7,
              }}>
                <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px", color: "#111" }}>
                  {viewingResume.name}
                </h2>
                <p style={{ color: "#666", marginBottom: "20px" }}>
                  {viewingResume.currentRole} • {viewingResume.location || "San Francisco, CA"} • {viewingResume.email || "candidate@email.com"}
                </p>
                
                <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "20px 0" }} />
                
                <h3 style={{ fontSize: "14px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#333", marginBottom: "12px" }}>
                  Summary
                </h3>
                <p style={{ color: "#444", marginBottom: "24px" }}>
                  Experienced {viewingResume.currentRole.toLowerCase()} with {viewingResume.experience?.toLowerCase() || "several years"} of experience building scalable applications.
                  Proficient in {viewingResume.skills?.slice(0, 3).join(", ") || "modern technologies"} with a track record of delivering high-impact projects.
                </p>

                <h3 style={{ fontSize: "14px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#333", marginBottom: "12px" }}>
                  Experience
                </h3>
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <strong style={{ color: "#222" }}>{viewingResume.currentRole}</strong>
                    <span style={{ color: "#888", fontSize: "13px" }}>2021 - Present</span>
                  </div>
                  <p style={{ color: "#666", fontSize: "13px", marginBottom: "8px" }}>Tech Company Inc.</p>
                  <ul style={{ margin: 0, paddingLeft: "20px", color: "#444" }}>
                    <li>Led development of core product features used by millions of users</li>
                    <li>Mentored junior engineers and conducted code reviews</li>
                    <li>Improved system performance by 40% through optimization</li>
                  </ul>
                </div>

                <h3 style={{ fontSize: "14px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#333", marginBottom: "12px" }}>
                  Skills
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {(viewingResume.skills || ["JavaScript", "React", "Node.js", "Python"]).map((skill: string) => (
                    <span key={skill} style={{
                      padding: "4px 12px",
                      background: "#f0f0f0",
                      borderRadius: "4px",
                      fontSize: "13px",
                      color: "#444",
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>

                <h3 style={{ fontSize: "14px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#333", marginTop: "24px", marginBottom: "12px" }}>
                  Education
                </h3>
                <div>
                  <strong style={{ color: "#222" }}>Bachelor of Science in Computer Science</strong>
                  <p style={{ color: "#666", fontSize: "13px", margin: "4px 0 0" }}>University • 2017</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
      </>
    );
  }

  // Results View - Dedicated full page for results
  if (view === "results" && selectedJob) {
    const sortedCandidates = [...mockCandidates].sort((a, b) => b.score - a.score);
    const excellentMatches = sortedCandidates.filter(c => c.score >= 90).length;
    const strongMatches = sortedCandidates.filter(c => c.score >= 75 && c.score < 90).length;
    const potentialMatches = sortedCandidates.filter(c => c.score >= 60 && c.score < 75).length;

    return (
      <div style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        backgroundImage: "var(--gradient-mesh)",
      }}>
        {/* Header */}
        <div style={{
          padding: "24px 40px",
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--bg-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <button
              onClick={() => setView("chat")}
              style={{
                background: "var(--bg-glass)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "10px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--text-secondary)",
                fontSize: "14px",
                fontWeight: 500,
                transition: "var(--transition-fast)",
              }}
            >
              <BackIcon /> Edit Criteria
            </button>
            <div>
              <h1 style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "4px",
              }}>
                Candidate Results
              </h1>
              <p style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>
                {selectedJob.title} • {sortedCandidates.length} candidates analyzed
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => setView("jobs")}
              style={{
                padding: "10px 20px",
                borderRadius: "var(--radius-md)",
                background: "transparent",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "var(--transition-fast)",
              }}
            >
              Back to Jobs
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          padding: "32px 40px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
        }}>
          <div style={{
            ...glassCardStyle,
            padding: "24px",
            animation: "slideUp 0.4s ease",
          }}>
            <div style={{
              fontSize: "13px",
              color: "var(--text-tertiary)",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Total Candidates
            </div>
            <div style={{
              fontSize: "36px",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}>
              {sortedCandidates.length}
            </div>
          </div>

          <div style={{
            ...glassCardStyle,
            padding: "24px",
            animation: "slideUp 0.4s ease",
            animationDelay: "0.1s",
            animationFillMode: "both",
          }}>
            <div style={{
              fontSize: "13px",
              color: "var(--accent-success)",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Strong Fit (90+)
            </div>
            <div style={{
              fontSize: "36px",
              fontWeight: 700,
              color: "var(--accent-success)",
            }}>
              {excellentMatches}
            </div>
          </div>

          <div style={{
            ...glassCardStyle,
            padding: "24px",
            animation: "slideUp 0.4s ease",
            animationDelay: "0.2s",
            animationFillMode: "both",
          }}>
            <div style={{
              fontSize: "13px",
              color: "var(--accent-primary)",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Good Fit (75-89)
            </div>
            <div style={{
              fontSize: "36px",
              fontWeight: 700,
              color: "var(--accent-primary)",
            }}>
              {strongMatches}
            </div>
          </div>

          <div style={{
            ...glassCardStyle,
            padding: "24px",
            animation: "slideUp 0.4s ease",
            animationDelay: "0.3s",
            animationFillMode: "both",
          }}>
            <div style={{
              fontSize: "13px",
              color: "var(--accent-warning)",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Moderate Fit (60-74)
            </div>
            <div style={{
              fontSize: "36px",
              fontWeight: 700,
              color: "var(--accent-warning)",
            }}>
              {potentialMatches}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ padding: "0 40px 20px" }}>
          <div style={{
            display: "flex",
            gap: "8px",
            padding: "6px",
            background: "var(--bg-card)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-subtle)",
            width: "fit-content",
          }}>
            {[
              { key: "all", label: "All", count: sortedCandidates.length },
              { key: "excellent", label: "Strong Fit", count: excellentMatches, color: "var(--accent-success)" },
              { key: "strong", label: "Good Fit", count: strongMatches, color: "var(--accent-primary)" },
              { key: "potential", label: "Moderate", count: potentialMatches, color: "var(--accent-warning)" },
              { key: "weak", label: "Review", count: sortedCandidates.filter(c => c.score < 60).length, color: "var(--accent-error)" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setScoreFilter(tab.key as typeof scoreFilter)}
                style={{
                  padding: "10px 18px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: scoreFilter === tab.key ? "var(--bg-tertiary)" : "transparent",
                  color: scoreFilter === tab.key ? (tab.color || "var(--text-primary)") : "var(--text-secondary)",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "var(--transition-fast)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {tab.label}
                <span style={{
                  padding: "2px 8px",
                  borderRadius: "var(--radius-full)",
                  background: scoreFilter === tab.key ? (tab.color ? `${tab.color}20` : "var(--bg-glass)") : "var(--bg-glass)",
                  color: scoreFilter === tab.key ? (tab.color || "var(--text-primary)") : "var(--text-muted)",
                  fontSize: "11px",
                  fontWeight: 600,
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Table with Expandable Rows */}
        <div style={{ padding: "0 40px 40px" }}>
          <div style={{
            ...glassCardStyle,
            overflow: "hidden",
          }}>
            <div style={{ overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "var(--bg-tertiary)" }}>
                    <th style={{ padding: "14px 16px", width: "40px" }}></th>
                    {["#", "Name", "Role", "Stage", "Location", "Exp", "Fit", "Resume"].map((col) => (
                      <th
                        key={col}
                        style={{
                          padding: "14px 16px",
                          textAlign: col === "Score" ? "right" : "left",
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                          borderBottom: "1px solid var(--border-subtle)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedCandidates
                    .filter(c => {
                      if (scoreFilter === "all") return true;
                      if (scoreFilter === "excellent") return c.score >= 90;
                      if (scoreFilter === "strong") return c.score >= 75 && c.score < 90;
                      if (scoreFilter === "potential") return c.score >= 60 && c.score < 75;
                      if (scoreFilter === "weak") return c.score < 60;
                      return true;
                    })
                    .map((candidate, index) => {
                      const stageBadge = getStageBadge(candidate.stage);
                      const isExpanded = expandedCandidate === candidate.id;
                      return (
                        <>
                          <tr
                            key={candidate.id}
                            onClick={() => setExpandedCandidate(isExpanded ? null : candidate.id)}
                            style={{
                              borderBottom: isExpanded ? "none" : "1px solid var(--border-subtle)",
                              transition: "var(--transition-fast)",
                              cursor: "pointer",
                              background: isExpanded ? "var(--bg-glass)" : "transparent",
                            }}
                            onMouseEnter={(e) => {
                              if (!isExpanded) e.currentTarget.style.background = "var(--bg-glass-hover)";
                            }}
                            onMouseLeave={(e) => {
                              if (!isExpanded) e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <td style={{ padding: "14px 16px", textAlign: "center" }}>
                              <span style={{
                                display: "inline-block",
                                transition: "var(--transition-fast)",
                                transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                                color: "var(--text-muted)",
                              }}>
                                ▶
                              </span>
                            </td>
                            <td style={{ padding: "14px 16px", color: "var(--text-muted)" }}>
                              {index + 1}
                            </td>
                            <td style={{ padding: "14px 16px", fontWeight: 500, color: "var(--text-primary)" }}>
                              {candidate.name}
                            </td>
                            <td style={{ padding: "14px 16px", color: "var(--text-secondary)" }}>
                              {candidate.currentRole}
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <span style={{
                                padding: "4px 10px",
                                borderRadius: "var(--radius-full)",
                                background: stageBadge.bg,
                                color: stageBadge.text,
                                fontSize: "11px",
                                fontWeight: 500,
                              }}>
                                {candidate.stage}
                              </span>
                            </td>
                            <td style={{ padding: "14px 16px", color: "var(--text-secondary)" }}>
                              {candidate.location}
                            </td>
                            <td style={{ padding: "14px 16px", color: "var(--text-secondary)" }}>
                              {candidate.experience}
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <span style={{
                                padding: "5px 12px",
                                borderRadius: "var(--radius-full)",
                                background: candidate.score >= 90 ? "rgba(34, 197, 94, 0.15)" : candidate.score >= 75 ? "rgba(19, 129, 58, 0.15)" : candidate.score >= 60 ? "rgba(234, 179, 8, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                color: getScoreColor(candidate.score),
                                fontSize: "12px",
                                fontWeight: 500,
                              }}>
                                {candidate.score >= 90 ? "Strong" : candidate.score >= 75 ? "Good" : candidate.score >= 60 ? "Moderate" : "Review"}
                              </span>
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingResume(candidate);
                                }}
                                style={{
                                  padding: "6px 12px",
                                  borderRadius: "6px",
                                  background: "rgba(139, 92, 246, 0.15)",
                                  border: "none",
                                  fontSize: "12px",
                                  color: "#8b5cf6",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                  <polyline points="14 2 14 8 20 8"></polyline>
                                  <line x1="16" y1="13" x2="8" y2="13"></line>
                                  <line x1="16" y1="17" x2="8" y2="17"></line>
                                  <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                                View
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr key={`${candidate.id}-expanded`}>
                              <td colSpan={9} style={{
                                padding: "0 16px 20px 56px",
                                background: "var(--bg-glass)",
                                borderBottom: "1px solid var(--border-subtle)",
                              }}>
                                <div style={{
                                  padding: "16px 20px",
                                  background: "var(--bg-card)",
                                  borderRadius: "var(--radius-md)",
                                  border: "1px solid var(--border-subtle)",
                                }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                                    <span style={{
                                      padding: "6px 14px",
                                      borderRadius: "var(--radius-full)",
                                      background: candidate.score >= 90 ? "rgba(34, 197, 94, 0.15)" : candidate.score >= 75 ? "rgba(19, 129, 58, 0.15)" : candidate.score >= 60 ? "rgba(234, 179, 8, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                      color: getScoreColor(candidate.score),
                                      fontSize: "13px",
                                      fontWeight: 600,
                                    }}>
                                      {candidate.score >= 90 ? "Strong Fit" : candidate.score >= 75 ? "Good Fit" : candidate.score >= 60 ? "Moderate Fit" : "Needs Review"}
                                    </span>
                                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                                      Score: {candidate.score}/100
                                    </span>
                                  </div>
                                  <p style={{ fontSize: "14px", color: "var(--text-primary)", lineHeight: 1.7 }}>
                                    {candidate.reason}
                                  </p>
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
          </div>
        </div>

        {/* Resume Modal */}
        {viewingResume && (
          <div 
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 200,
              animation: "fadeIn 0.2s ease",
            }}
            onClick={() => setViewingResume(null)}
          >
            <div 
              style={{
                width: "90%",
                maxWidth: "800px",
                maxHeight: "85vh",
                background: "#1a1a1a",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                flexDirection: "column",
                animation: "scaleIn 0.2s ease",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{
                padding: "20px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                    {viewingResume.name}
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                    {viewingResume.currentRole} • {viewingResume.experience}
                  </p>
                </div>
                <button
                  onClick={() => setViewingResume(null)}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.08)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-secondary)",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* AI Assessment Banner */}
              <div style={{
                padding: "16px 24px",
                background: viewingResume.score >= 75 ? "rgba(34, 197, 94, 0.08)" : "rgba(234, 179, 8, 0.08)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <span style={{
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    background: viewingResume.score >= 90 ? "rgba(34, 197, 94, 0.2)" : viewingResume.score >= 75 ? "rgba(19, 129, 58, 0.2)" : viewingResume.score >= 60 ? "rgba(234, 179, 8, 0.2)" : "rgba(239, 68, 68, 0.2)",
                    color: getScoreColor(viewingResume.score),
                  }}>
                    {viewingResume.score >= 90 ? "Strong Fit" : viewingResume.score >= 75 ? "Good Fit" : viewingResume.score >= 60 ? "Moderate Fit" : "Needs Review"}
                  </span>
                  <span style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>AI Assessment</span>
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                  {viewingResume.reason}
                </p>
              </div>

              {/* Resume Content */}
              <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
                <div style={{ 
                  background: "white", 
                  borderRadius: "8px", 
                  padding: "32px",
                  color: "#1a1a1a",
                  fontSize: "14px",
                  lineHeight: 1.7,
                }}>
                  <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px", color: "#111" }}>
                    {viewingResume.name}
                  </h2>
                  <p style={{ color: "#666", marginBottom: "20px" }}>
                    {viewingResume.currentRole} • {viewingResume.location || "San Francisco, CA"} • {viewingResume.email || "candidate@email.com"}
                  </p>
                  
                  <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "20px 0" }} />
                  
                  <h3 style={{ fontSize: "14px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#333", marginBottom: "12px" }}>
                    Summary
                  </h3>
                  <p style={{ color: "#444", marginBottom: "24px" }}>
                    Experienced {viewingResume.currentRole.toLowerCase()} with {viewingResume.experience?.toLowerCase() || "several years"} of experience building scalable applications.
                    Proficient in {viewingResume.skills?.slice(0, 3).join(", ") || "modern technologies"} with a track record of delivering high-impact projects.
                  </p>

                  <h3 style={{ fontSize: "14px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#333", marginBottom: "12px" }}>
                    Experience
                  </h3>
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <strong style={{ color: "#222" }}>{viewingResume.currentRole}</strong>
                      <span style={{ color: "#888", fontSize: "13px" }}>2021 - Present</span>
                    </div>
                    <p style={{ color: "#666", fontSize: "13px", marginBottom: "8px" }}>Tech Company Inc.</p>
                    <ul style={{ margin: 0, paddingLeft: "20px", color: "#444" }}>
                      <li>Led development of core product features used by millions of users</li>
                      <li>Mentored junior engineers and conducted code reviews</li>
                      <li>Improved system performance by 40% through optimization</li>
                    </ul>
                  </div>

                  <h3 style={{ fontSize: "14px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#333", marginBottom: "12px" }}>
                    Skills
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {(viewingResume.skills || ["JavaScript", "React", "Node.js", "Python"]).map((skill: string) => (
                      <span key={skill} style={{
                        padding: "4px 12px",
                        background: "#f0f0f0",
                        borderRadius: "4px",
                        fontSize: "13px",
                        color: "#444",
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>

                  <h3 style={{ fontSize: "14px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#333", marginTop: "24px", marginBottom: "12px" }}>
                    Education
                  </h3>
                  <div>
                    <strong style={{ color: "#222" }}>Bachelor of Science in Computer Science</strong>
                    <p style={{ color: "#666", fontSize: "13px", margin: "4px 0 0" }}>University • 2017</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
