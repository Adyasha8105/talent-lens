"use client";

import { Message } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] px-5 py-4 text-[15px] leading-relaxed",
          isUser
            ? "bg-accent text-white rounded-[18px] rounded-br-[4px] shadow-lg shadow-accent/30"
            : "bg-white/[0.08] text-white rounded-[18px] rounded-bl-[4px]"
        )}
        dangerouslySetInnerHTML={{
          __html: message.content
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
            .replace(/\n/g, "<br/>"),
        }}
      />
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white/[0.08] rounded-[18px] rounded-bl-[4px] px-5 py-4">
        <div className="flex gap-1 items-center">
          <div className="w-2 h-2 rounded-full bg-text-tertiary animate-bounce-dots" />
          <div className="w-2 h-2 rounded-full bg-text-tertiary animate-bounce-dots [animation-delay:0.2s]" />
          <div className="w-2 h-2 rounded-full bg-text-tertiary animate-bounce-dots [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
}

