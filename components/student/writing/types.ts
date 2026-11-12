export type WritingPrompt = {
  id: string;
  title: string;
  prompt: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  minWords: number;
};

export type FeedbackObject = {
  grammar?: string;
  vocabulary?: string;
  content?: string;
  organization?: string;
  suggestions?: string[];
};

export type Submission = {
  id: string;
  score: number;
  status?: string;
  responseText?: string;
  scores?: {
    grammar: number;
    clarity: number;
    structure: number;
    overall: number;
  };
  feedback: string | FeedbackObject | null;
  submittedAt: string;
  prompt: { title: string };
  revisions?: {
    id: string;
    responseText: string;
    wordCount: number;
    overallScore: number | null;
    grammarScore: number | null;
    clarityScore: number | null;
    structureScore: number | null;
    createdAt: string;
  }[];
};

export type RevisionResult = {
  id: string;
  submissionId: string;
  originalText: string;
  revisedText: string;
  wordCount: number;
  scores: {
    overall: number;
    grammar: number | null;
    clarity: number | null;
    structure: number | null;
  };
  originalScores: {
    overall: number;
    grammar: number;
    clarity: number;
    structure: number;
  };
  delta: {
    overall: number;
    grammar: number;
    clarity: number;
    structure: number;
  };
  feedback: string | FeedbackObject | null;
  createdAt: string;
};
