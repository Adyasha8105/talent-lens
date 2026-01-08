import { Criterion } from "./types";

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-success";
  if (score >= 75) return "text-accent";
  if (score >= 60) return "text-warning";
  return "text-error";
}

export function getScoreBg(score: number): string {
  if (score >= 90) return "bg-success/15";
  if (score >= 75) return "bg-accent/15";
  if (score >= 60) return "bg-warning/15";
  return "bg-error/15";
}

export function getFitLabel(score: number): string {
  if (score >= 90) return "Strong";
  if (score >= 75) return "Good";
  if (score >= 60) return "Moderate";
  return "Review";
}

export function getStageBadgeStyles(stage: string): { bg: string; text: string } {
  switch (stage) {
    case "Hired":
      return { bg: "bg-success/15", text: "text-success" };
    case "Offer":
      return { bg: "bg-accent/15", text: "text-accent" };
    case "Onsite":
      return { bg: "bg-purple/15", text: "text-purple" };
    case "Phone Screen":
      return { bg: "bg-warning/15", text: "text-warning" };
    case "Rejected":
      return { bg: "bg-error/15", text: "text-error" };
    default:
      return { bg: "bg-bg-glass", text: "text-text-secondary" };
  }
}

export function parseJobTitle(title: string): string[] {
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
}

export function parseUserInput(input: string): Criterion[] {
  const criteria: Criterion[] = [];
  const lower = input.toLowerCase();
  
  // Experience parsing
  const expMatch = lower.match(/(\d+)\+?\s*(?:years?|yrs?)/);
  if (expMatch) {
    criteria.push({ id: `exp-${Date.now()}`, type: "experience", value: `${expMatch[1]}+ years of experience` });
  }
  
  // Skills
  const skills = ["python", "javascript", "typescript", "react", "node", "go", "rust", "java", "kubernetes", "docker", "aws", "gcp", "azure"];
  skills.forEach(skill => {
    if (lower.includes(skill)) {
      criteria.push({ id: `skill-${skill}-${Date.now()}`, type: "skill", value: `${skill.charAt(0).toUpperCase() + skill.slice(1)} proficiency` });
    }
  });
  
  // FAANG
  if (lower.includes("faang") || lower.includes("big tech") || lower.includes("google") || lower.includes("meta") || lower.includes("amazon")) {
    criteria.push({ id: `bg-faang-${Date.now()}`, type: "background", value: "FAANG or top-tier tech company experience" });
  }
  
  // Leadership
  if (lower.includes("lead") || lower.includes("manage") || lower.includes("team")) {
    criteria.push({ id: `lead-${Date.now()}`, type: "leadership", value: "Team leadership experience" });
  }
  
  // Location
  if (lower.includes("sf") || lower.includes("san francisco") || lower.includes("bay area")) {
    criteria.push({ id: `loc-sf-${Date.now()}`, type: "location", value: "San Francisco Bay Area" });
  }
  if (lower.includes("remote")) {
    criteria.push({ id: `loc-remote-${Date.now()}`, type: "location", value: "Open to remote work" });
  }
  
  // Generic if nothing matched
  if (criteria.length === 0 && input.trim()) {
    criteria.push({ id: `custom-${Date.now()}`, type: "custom", value: input.trim() });
  }
  
  return criteria;
}

export function generatePrompt(jobTitle: string, criteria: Criterion[]): string {
  const roleContext = parseJobTitle(jobTitle);
  
  let prompt = `Evaluate candidates for: ${jobTitle}\n\n`;
  
  if (roleContext.length > 0) {
    prompt += `## Role Context\n`;
    roleContext.forEach(ctx => {
      prompt += `• ${ctx}\n`;
    });
    prompt += `\n`;
  }
  
  if (criteria.length > 0) {
    prompt += `## Criteria\n`;
    const grouped: Record<string, string[]> = {};
    criteria.forEach(c => {
      if (!grouped[c.type]) grouped[c.type] = [];
      grouped[c.type].push(c.value);
    });
    
    Object.entries(grouped).forEach(([type, values]) => {
      prompt += `${type.charAt(0).toUpperCase() + type.slice(1)}:\n`;
      values.forEach(v => {
        prompt += `• ${v}\n`;
      });
    });
    prompt += `\n`;
  }
  
  prompt += `## Scoring\n`;
  prompt += `• 90-100: Excellent match\n`;
  prompt += `• 75-89: Strong match\n`;
  prompt += `• 60-74: Potential match\n`;
  prompt += `• Below 60: Weak match`;
  
  return prompt;
}

