"use client";

import React, { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────

interface QuestionReview {
  questionId: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  selectedAnswer: string;
  isCorrect: boolean;
  explanation: string | null;
  metadata: Record<string, unknown> | null;
}

interface WritingFeedbackData {
  essay: string;
  wordCount: number;
  feedback: unknown;
}

interface SpeakingFeedbackData {
  transcript: string | null;
  audioUrl: string | null;
  feedback: unknown;
}

export interface SectionReview {
  sectionType: string;
  rawScore: number;
  totalQuestions: number;
  correctCount: number;
  questions?: QuestionReview[];
  writingFeedback?: WritingFeedbackData;
  speakingFeedback?: SpeakingFeedbackData;
}

export interface AnswerReviewSectionProps {
  sections: SectionReview[];
  isLoading?: boolean;
}

// ── Section metadata ───────────────────────────────────────────────

const SECTION_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  VOCABULARY: { label: "Vocabulary", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", icon: "style" },
  GRAMMAR:    { label: "Grammar",    color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10", icon: "spellcheck" },
  LISTENING:  { label: "Listening",  color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-500/10", icon: "headphones" },
  READING:    { label: "Reading",    color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-500/10", icon: "menu_book" },
  WRITING:    { label: "Writing",    color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-500/10", icon: "edit_document" },
  SPEAKING:   { label: "Speaking",   color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10", icon: "record_voice_over" },
};

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

// ── Component ──────────────────────────────────────────────────────

export default function AnswerReviewSection({ sections, isLoading }: AnswerReviewSectionProps) {
  // Only show sections that have data to review
  const objectiveSections = sections.filter((s) => s.questions && s.questions.length > 0);
  const writingSection = sections.find((s) => s.writingFeedback);
  const speakingSection = sections.find((s) => s.speakingFeedback);

  const allTabs = [
    ...objectiveSections.map((s) => s.sectionType),
    ...(writingSection ? ["WRITING"] : []),
    ...(speakingSection ? ["SPEAKING"] : []),
  ];

  const [activeSection, setActiveSection] = useState(allTabs[0] ?? "VOCABULARY");
  const [showOnlyWrong, setShowOnlyWrong] = useState(false);

  // Keep activeSection in sync if allTabs changes
  const effectiveSection = allTabs.includes(activeSection) ? activeSection : (allTabs[0] ?? "VOCABULARY");

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#151D30] rounded-3xl border border-slate-200/60 dark:border-slate-800/80 p-8 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-inter text-xs text-slate-500 dark:text-slate-400">Memuat rincian soal dan pembahasan...</p>
      </div>
    );
  }

  if (allTabs.length === 0) return null;

  const currentObjective = objectiveSections.find((s) => s.sectionType === effectiveSection);

  // Stats for the active objective section
  const totalQ = currentObjective?.questions?.length ?? 0;
  const correctQ = currentObjective?.questions?.filter((q) => q.isCorrect).length ?? 0;
  const wrongQ = totalQ - correctQ;
  const displayQuestions = showOnlyWrong
    ? (currentObjective?.questions ?? []).filter((q) => !q.isCorrect)
    : (currentObjective?.questions ?? []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-350">
        <span className="material-symbols-outlined text-xl">fact_check</span>
        <h2 className="font-hanken text-lg font-bold text-slate-900 dark:text-white">
          Review Jawaban Tes
        </h2>
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2">
        {allTabs.map((type) => {
          const meta = SECTION_META[type] ?? { label: type, color: "", bg: "", icon: "help" };
          const isActive = type === effectiveSection;
          const sec = objectiveSections.find((s) => s.sectionType === type);
          const hasWrong = sec ? sec.questions?.some((q) => !q.isCorrect) : false;

          return (
            <button
              key={type}
              onClick={() => { setActiveSection(type); setShowOnlyWrong(false); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                isActive
                  ? `${meta.bg} ${meta.color} border-current/20 shadow-sm`
                  : "bg-white dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <span className="material-symbols-outlined text-sm">{meta.icon}</span>
              {meta.label}
              {hasWrong && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 ml-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Objective section content */}
      {currentObjective && (
        <div className="space-y-4">
          {/* Stats bar */}
          <div className="flex items-center justify-between bg-white dark:bg-[#151D30] rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-4">
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="text-slate-500 dark:text-slate-400">
                {totalQ} soal
              </span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                {correctQ} benar
              </span>
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                <span className="material-symbols-outlined text-sm">cancel</span>
                {wrongQ} salah
              </span>
            </div>
            {wrongQ > 0 && (
              <button
                onClick={() => setShowOnlyWrong((v) => !v)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  showOnlyWrong
                    ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/30"
                    : "bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60"
                }`}
              >
                {showOnlyWrong ? "Tampilkan Semua" : "Hanya Salah"}
              </button>
            )}
          </div>

          {/* Question list */}
          <div className="space-y-3">
            {displayQuestions.length === 0 && showOnlyWrong && (
              <div className="text-center py-8 text-sm text-slate-400 dark:text-slate-500">
                <span className="material-symbols-outlined text-3xl mb-2 block">celebration</span>
                Semua jawaban Anda benar di seksi ini!
              </div>
            )}
            {displayQuestions.map((q, idx) => (
              <QuestionCard key={q.questionId} question={q} index={idx + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Writing feedback */}
      {effectiveSection === "WRITING" && writingSection?.writingFeedback && (
        <SubjectiveFeedbackCard
          type="writing"
          content={writingSection.writingFeedback.essay}
          wordCount={writingSection.writingFeedback.wordCount}
          feedback={writingSection.writingFeedback.feedback}
          rawScore={writingSection.rawScore}
        />
      )}

      {/* Speaking feedback */}
      {effectiveSection === "SPEAKING" && speakingSection?.speakingFeedback && (
        <SubjectiveFeedbackCard
          type="speaking"
          content={speakingSection.speakingFeedback.transcript}
          feedback={speakingSection.speakingFeedback.feedback}
          rawScore={speakingSection.rawScore}
        />
      )}
    </div>
  );
}

// ── QuestionCard ────────────────────────────────────────────────────

function QuestionCard({ question, index }: { question: QuestionReview; index: number }) {
  const [expanded, setExpanded] = useState(!question.isCorrect);

  return (
    <div
      className={`bg-white dark:bg-[#151D30] rounded-2xl border p-5 transition-all ${
        question.isCorrect
          ? "border-slate-200/60 dark:border-slate-800/80"
          : "border-rose-200/60 dark:border-rose-900/40"
      }`}
    >
      {/* Question header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start gap-3 text-left cursor-pointer"
      >
        <span
          className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
            question.isCorrect
              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
          }`}
        >
          {question.isCorrect ? "✓" : "✗"}
        </span>
        <div className="flex-grow min-w-0">
          <p className="font-inter text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
            <span className="font-bold text-slate-400 dark:text-slate-500 mr-1.5">#{index}</span>
            {question.questionText}
          </p>
        </div>
        <span className={`material-symbols-outlined text-slate-400 transition-transform flex-shrink-0 ${expanded ? "rotate-180" : ""}`}>
          expand_more
        </span>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 ml-10 space-y-3">
          {/* Options */}
          <div className="space-y-1.5">
            {question.options.map((opt, i) => {
              const letter = OPTION_LETTERS[i] ?? String(i + 1);
              const isCorrectOption = opt === question.correctAnswer;
              const isSelectedOption = opt === question.selectedAnswer;
              const isWrongSelection = isSelectedOption && !question.isCorrect;

              return (
                <div
                  key={`${question.questionId}-opt-${i}`}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-inter transition-all ${
                    isCorrectOption
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/30"
                      : isWrongSelection
                      ? "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/30 line-through"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                    isCorrectOption
                      ? "bg-emerald-500 text-white"
                      : isWrongSelection
                      ? "bg-rose-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}>
                    {letter}
                  </span>
                  <span className="leading-relaxed">{opt}</span>
                  {isCorrectOption && (
                    <span className="material-symbols-outlined text-emerald-500 text-sm ml-auto">check_circle</span>
                  )}
                  {isWrongSelection && (
                    <span className="material-symbols-outlined text-rose-500 text-sm ml-auto">cancel</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          {question.explanation && (
            <div className="bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200/50 dark:border-amber-900/30 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5 flex-shrink-0">lightbulb</span>
                <div>
                  <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest block mb-1">
                    Penjelasan
                  </span>
                  <p className="font-inter text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── SubjectiveFeedbackCard (Writing / Speaking) ────────────────────

interface SubjectiveFeedbackCardProps {
  type: "writing" | "speaking";
  content: string | null;
  wordCount?: number;
  feedback: unknown;
  rawScore: number;
}

interface FeedbackFields {
  grammar?: string;
  vocabulary?: string;
  content?: string;
  organization?: string;
  fluency?: string;
  pronunciation?: string;
  suggestions?: string[];
  overallFeedback?: string;
  [key: string]: unknown;
}

function SubjectiveFeedbackCard({ type, content, wordCount, feedback, rawScore }: SubjectiveFeedbackCardProps) {
  const meta = SECTION_META[type.toUpperCase()];
  const fb = (typeof feedback === "object" && feedback !== null ? feedback : {}) as FeedbackFields;

  const feedbackEntries = Object.entries(fb).filter(
    ([key, val]) => typeof val === "string" && key !== "overallFeedback" && key !== "scoringContext" && val.length > 0
  );

  return (
    <div className="bg-white dark:bg-[#151D30] rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-6 space-y-5">
      {/* Score header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${meta?.bg} ${meta?.color} flex items-center justify-center border border-current/10`}>
            <span className="material-symbols-outlined">{meta?.icon}</span>
          </div>
          <div>
            <h3 className="font-hanken text-sm font-bold text-slate-900 dark:text-white">
              {type === "writing" ? "Esai Anda" : "Transkrip Rekaman Anda"}
            </h3>
            {wordCount !== undefined && (
              <p className="text-xs text-slate-400">{wordCount} kata</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-black text-slate-900 dark:text-white">
            {Math.round(rawScore)}
            <span className="text-xs font-semibold text-slate-400 ml-0.5">%</span>
          </p>
        </div>
      </div>

      {/* Student's response */}
      {content && (
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200/40 dark:border-slate-700/40">
          <p className="font-inter text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {content}
          </p>
        </div>
      )}

      {/* AI feedback breakdown */}
      {feedbackEntries.length > 0 && (
        <div className="space-y-3">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Umpan Balik AI
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {feedbackEntries.map(([key, value]) => {
              if (key === "suggestions") return null;
              return (
                <div key={key} className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200/30 dark:border-slate-700/30 space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <p className="font-inter text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {String(value)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {fb.suggestions && fb.suggestions.length > 0 && (
        <div className="bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200/50 dark:border-amber-900/30 rounded-xl p-4 space-y-2">
          <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">lightbulb</span>
            Rekomendasi Perbaikan
          </span>
          <ul className="space-y-1.5">
            {fb.suggestions.map((s: string, i: number) => (
              <li key={`${s.slice(0, 20)}-${i}`} className="flex gap-2 items-start font-inter text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5 flex-shrink-0">check_circle</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
