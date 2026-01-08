"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";

export default function OnboardingPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      router.push("/jobs");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-6">
      <div className="w-full max-w-md animate-fade-in">
        {/* Back Button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-8 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Connect your ATS</h1>
          <p className="text-text-secondary">
            We need API access to pull your job listings and candidates.
          </p>
        </div>

        {/* Help Text */}
        <div className="bg-bg-glass border border-border-subtle rounded-lg p-4 mb-6 text-sm text-text-secondary">
          You can find your API key in your ATS settings, usually under{" "}
          <strong className="text-text-primary">Integrations</strong> or{" "}
          <strong className="text-text-primary">Developer Settings</strong>.
        </div>

        {/* API Key Input */}
        <div className="mb-6">
          <label className="block text-sm text-text-secondary mb-2">API Key</label>
          <Input
            type={showKey ? "text" : "password"}
            placeholder="Enter your API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="text-text-muted hover:text-text-secondary transition-colors"
              >
                {showKey ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
          />
        </div>

        {/* Connect Button */}
        <Button
          className="w-full"
          onClick={handleConnect}
          disabled={!apiKey.trim()}
          loading={isConnecting}
        >
          {isConnecting ? "Connecting..." : "Connect"}
        </Button>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );
}

