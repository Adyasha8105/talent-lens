"use client";

import { Candidate } from "@/lib/types";
import { Modal, ModalHeader, ModalContent } from "@/components/ui";
import { cn, getScoreColor, getScoreBg, getFitLabel } from "@/lib/utils";

interface ResumeModalProps {
  candidate: Candidate;
  onClose: () => void;
}

export function ResumeModal({ candidate, onClose }: ResumeModalProps) {
  return (
    <Modal isOpen={true} onClose={onClose} className="w-[90%] max-w-[800px]">
      <ModalHeader onClose={onClose}>
        <div>
          <h3 className="text-lg font-semibold text-text-primary">{candidate.name}</h3>
          <p className="text-sm text-text-secondary">
            {candidate.currentRole} • {candidate.experience}
          </p>
        </div>
      </ModalHeader>

      {/* AI Assessment */}
      <div className={cn(
        "px-6 py-4 border-b border-white/[0.06]",
        candidate.score >= 75 ? "bg-success/[0.08]" : "bg-warning/[0.08]"
      )}>
        <div className="flex items-center gap-3 mb-2">
          <span className={cn(
            "px-2.5 py-1 rounded-full text-xs font-semibold",
            getScoreBg(candidate.score),
            getScoreColor(candidate.score)
          )}>
            {getFitLabel(candidate.score)} Fit
          </span>
          <span className="text-sm text-text-tertiary">AI Assessment</span>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">{candidate.reason}</p>
      </div>

      <ModalContent>
        {/* Resume Content */}
        <div className="bg-white rounded-lg p-8 text-gray-900">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{candidate.name}</h2>
          <p className="text-gray-600 mb-5">
            {candidate.currentRole} • {candidate.location} • {candidate.email}
          </p>

          <hr className="border-gray-200 my-5" />

          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-3">Summary</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Experienced {candidate.currentRole.toLowerCase()} with {candidate.experience.toLowerCase()} of experience 
            building scalable applications. Proficient in {candidate.skills.slice(0, 3).join(", ")} with a track 
            record of delivering high-impact projects.
          </p>

          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-3">Experience</h3>
          <div className="mb-6">
            <div className="flex justify-between mb-1">
              <strong className="text-gray-800">{candidate.currentRole}</strong>
              <span className="text-gray-500 text-sm">2021 - Present</span>
            </div>
            <p className="text-gray-500 text-sm mb-2">Tech Company Inc.</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Led development of core product features used by millions of users</li>
              <li>Mentored junior engineers and conducted code reviews</li>
              <li>Improved system performance by 40% through optimization</li>
            </ul>
          </div>

          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {candidate.skills.map((skill) => (
              <span key={skill} className="px-3 py-1 bg-gray-100 rounded text-sm text-gray-700">
                {skill}
              </span>
            ))}
          </div>

          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-3">Education</h3>
          <div>
            <strong className="text-gray-800">Bachelor of Science in Computer Science</strong>
            <p className="text-gray-500 text-sm">University • 2017</p>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}

