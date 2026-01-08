"use client";

import { cn } from "@/lib/utils";
import { useEffect, useCallback, ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, children, className }: ModalProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-bg-secondary border border-border-subtle rounded-2xl max-h-[85vh] overflow-hidden flex flex-col animate-scale-in",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return (
    <div className="flex items-center justify-between p-5 border-b border-border-subtle">
      <div>{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-lg bg-bg-glass hover:bg-bg-glass-hover flex items-center justify-center text-text-secondary transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  );
}

export function ModalContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex-1 overflow-auto p-6", className)}>{children}</div>;
}

