"use client";

import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Message, Criterion, Candidate } from "@/lib/types";
import { mockJobs, quickSuggestions, mockCandidates } from "@/lib/mock-data";
import { parseUserInput, generatePrompt } from "@/lib/utils";
import { ChatMessage, TypingIndicator } from "@/components/chat/chat-message";
import { PromptPanel } from "@/components/chat/prompt-panel";
import { SampleResultsDrawer } from "@/components/chat/sample-results-drawer";
import { ResumeModal } from "@/components/chat/resume-modal";

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export default function ChatPage({ params }: ChatPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const job = mockJobs.find((j) => j.id === id);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [sampleResults, setSampleResults] = useState<Candidate[] | null>(null);
  const [viewingResume, setViewingResume] = useState<Candidate | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showPromptPanel = criteria.length > 0;

  // Initialize messages when job loads
  useEffect(() => {
    if (job) {
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: `Let's build the ideal candidate criteria for **${job.title}**.\n\nWhat experience, skills, or background are you looking for?`,
        },
      ]);
    }
  }, [job]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && sampleResults) {
        setSampleResults(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sampleResults]);

  // Update prompt when criteria change
  useEffect(() => {
    if (criteria.length > 0 && job) {
      setGeneratedPrompt(generatePrompt(job.title, criteria));
    }
  }, [criteria, job]);

  if (!job) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary">
        <p className="text-text-secondary">Job not found</p>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputText.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Parse and add criteria
    const newCriteria = parseUserInput(inputText);
    setCriteria((prev) => [...prev, ...newCriteria]);

    // Simulate AI response
    setTimeout(() => {
      const criteriaText = newCriteria.map((c) => c.value).join(", ");
      const response: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: `Added: **${criteriaText}**\n\nAre there any specific technical skills or technologies they should have?`,
      };
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInputText(suggestion);
    inputRef.current?.focus();
    setTimeout(() => {
      inputRef.current?.setSelectionRange(suggestion.length, suggestion.length);
    }, 0);
  };

  const handleTestSample = () => {
    setIsTesting(true);
    setTimeout(() => {
      setSampleResults(mockCandidates.slice(0, 5));
      setIsTesting(false);
    }, 1500);
  };

  const handleRunAll = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setSampleResults(null);
      router.push(`/jobs/${id}/results`);
    }, 2000);
  };

  return (
    <>
      <div className="h-screen bg-[#0a0a0a] flex overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-3 border-b border-white/[0.06] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/jobs")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.08] text-text-secondary text-sm hover:bg-white/[0.12] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Back
              </button>
              <span className="px-3 py-1.5 rounded-md bg-accent/15 text-accent text-sm font-medium">
                {job.title}
              </span>
            </div>
            <span className="text-sm text-text-muted">{job.candidateCount} candidates</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto">
            <div className="max-w-[800px] mx-auto px-6 py-8 space-y-8">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Suggestions */}
          {messages.length === 1 && (
            <div className="max-w-[800px] mx-auto px-6 pb-6 shrink-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {quickSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleQuickSuggestion(suggestion)}
                    className="px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-text-primary text-left hover:bg-white/10 hover:border-accent transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="px-6 py-5 shrink-0">
            <div className="max-w-[800px] mx-auto">
              <div className="flex gap-2 items-end bg-white/[0.05] rounded-2xl border border-white/10 p-1">
                <input
                  ref={inputRef}
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
                  className="flex-1 px-4 py-3 bg-transparent text-[15px] text-text-primary placeholder:text-text-muted outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isTyping}
                  className="w-10 h-10 rounded-xl bg-accent disabled:bg-transparent flex items-center justify-center text-white disabled:text-text-muted transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-2.5 text-xs text-text-muted shrink-0">
            Skill Grep may make mistakes. Consider checking important information.
          </div>
        </div>

        {/* Prompt Panel */}
        {showPromptPanel && (
          <PromptPanel
            prompt={generatedPrompt}
            onPromptChange={setGeneratedPrompt}
            job={job}
            isTesting={isTesting}
            isRunning={isRunning}
            hasSampleResults={!!sampleResults}
            onTestSample={handleTestSample}
            onRunAll={handleRunAll}
          />
        )}
      </div>

      {/* Sample Results Drawer */}
      {sampleResults && (
        <SampleResultsDrawer
          candidates={sampleResults}
          job={job}
          isRunning={isRunning}
          onClose={() => setSampleResults(null)}
          onRunAll={handleRunAll}
          onViewResume={setViewingResume}
        />
      )}

      {/* Resume Modal */}
      {viewingResume && (
        <ResumeModal
          candidate={viewingResume}
          onClose={() => setViewingResume(null)}
        />
      )}
    </>
  );
}

