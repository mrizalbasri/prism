"use client";

import React, { useState } from "react";
import WritingFeedback from "./WritingFeedback";
import type { FeedbackObject, RevisionResult, Submission, WritingPrompt } from "./types";

interface WritingRevisionViewProps {
  submission: Submission;
  prompt: WritingPrompt;
  initialEssay: string;
  onCancel: () => void;
  onRevisionSuccess?: (revision: RevisionResult) => void;
}

export default function WritingRevisionView({
  submission,
  prompt,
  initialEssay,
  onCancel,
  onRevisionSuccess,
}: WritingRevisionViewProps) {
  const [revisedEssay, setRevisedEssay] = useState(initialEssay);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revisionResult, setRevisionResult] = useState<RevisionResult | null>(null);
  const [activeTextTab, setActiveTextTab] = useState<"revised" | "original">("revised");

  const wordCount = revisedEssay.trim().split(/\s+/).filter((w) => w.length > 0).length;
  const isReadyToSubmit = wordCount >= prompt.minWords && revisedEssay.trim() !== "";

  async function handleRevisionSubmit() {
    if (!isReadyToSubmit || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/writing/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: submission.id,
          essay: revisedEssay,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mengirimkan revisi esai.");
        setIsSubmitting(false);
        return;
      }

      setRevisionResult(data.revision);
      if (onRevisionSuccess) {
        onRevisionSuccess(data.revision);
      }
    } catch (err) {
      console.error("Revision submit error:", err);
      setError("Terjadi kesalahan jaringan saat mengevaluasi revisi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── REVISION RESULT VIEW (AFTER EVALUATION) ─────────────────────────
  if (revisionResult) {
    const delta = revisionResult.delta.overall;
    const isImproved = delta > 0;
    const isSame = delta === 0;

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        {/* Header Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-inter text-sm font-semibold cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Kembali ke Hasil Utama
          </button>
          <span className="text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-500/10 px-3 py-1 rounded-full border border-orange-200/50">
            Revisi Berhasil
          </span>
        </div>

        {/* Score Comparison Banner */}
        <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 p-8 shadow-xl text-center space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Hasil Komparasi Skor Esai
            </span>
            <h2 className="font-hanken text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white">
              {isImproved
                ? "Luar Biasa! Skor Anda Meningkat 🚀"
                : isSame
                ? "Skor Anda Tetap Stabil"
                : "Evaluasi Hasil Revisi Anda"}
            </h2>
          </div>

          {/* Scores Side-by-Side Pill */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 py-2">
            {/* Original Score */}
            <div className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-gray-800/80 border border-slate-200/60 dark:border-gray-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Versi Awal
              </span>
              <p className="font-hanken text-3xl sm:text-4xl font-black text-slate-600 dark:text-slate-300">
                {Math.round(revisionResult.originalScores.overall)}
                <span className="text-xs text-slate-400 font-normal"> /100</span>
              </p>
            </div>

            <span className="material-symbols-outlined text-2xl text-slate-300 dark:text-slate-600 hidden sm:block">
              arrow_forward
            </span>

            {/* Revised Score */}
            <div className="text-center p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-500/10 border border-orange-200/60 dark:border-orange-900/30">
              <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block mb-1">
                Hasil Revisi
              </span>
              <p className="font-hanken text-3xl sm:text-4xl font-black text-orange-600 dark:text-orange-400">
                {Math.round(revisionResult.scores.overall)}
                <span className="text-xs text-orange-400 font-normal"> /100</span>
              </p>
            </div>

            {/* Delta Badge */}
            <div
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-mono font-bold ${
                isImproved
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60"
                  : isSame
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200/60"
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {isImproved ? "trending_up" : isSame ? "remove" : "trending_down"}
              </span>
              <span>
                {delta > 0 ? `+${delta}` : delta} Poin
              </span>
            </div>
          </div>

          {/* Sub-Criteria Delta Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              {
                label: "Grammar",
                orig: revisionResult.originalScores.grammar,
                rev: revisionResult.scores.grammar,
                delta: revisionResult.delta.grammar,
                color: "text-purple-600 dark:text-purple-400",
              },
              {
                label: "Clarity/Content",
                orig: revisionResult.originalScores.clarity,
                rev: revisionResult.scores.clarity,
                delta: revisionResult.delta.clarity,
                color: "text-green-600 dark:text-green-400",
              },
              {
                label: "Structure",
                orig: revisionResult.originalScores.structure,
                rev: revisionResult.scores.structure,
                delta: revisionResult.delta.structure,
                color: "text-orange-600 dark:text-orange-400",
              },
            ].map((crit) => {
              const critDelta = crit.delta;
              return (
                <div
                  key={crit.label}
                  className="bg-gray-50 dark:bg-gray-900/65 p-4 rounded-2xl border border-gray-150 dark:border-gray-800 text-center space-y-1"
                >
                  <p className="font-inter text-[10px] text-gray-450 dark:text-gray-500 uppercase font-bold tracking-wider">
                    {crit.label}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <span className={`font-mono text-lg font-black ${crit.color}`}>
                      {Math.round(crit.rev ?? 0)}%
                    </span>
                    {critDelta !== 0 && (
                      <span
                        className={`text-xs font-mono font-bold ${
                          critDelta > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        ({critDelta > 0 ? `+${critDelta}` : critDelta}%)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Feedback for the revision */}
          <div className="space-y-4 pt-4 text-left border-t border-gray-100 dark:border-gray-800">
            <h3 className="font-hanken text-base font-bold text-gray-950 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-600">reviews</span>
              Catatan Evaluasi AI untuk Revisi Ini
            </h3>
            <WritingFeedback feedback={revisionResult.feedback as FeedbackObject} />
          </div>

          {/* Text Comparison Toggle */}
          <div className="space-y-3 pt-4 text-left border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="font-hanken text-sm font-bold text-gray-950 dark:text-white">
                Bandingkan Teks Esai
              </h3>
              <div className="flex bg-slate-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setActiveTextTab("revised")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTextTab === "revised"
                      ? "bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  Versi Revisi
                </button>
                <button
                  onClick={() => setActiveTextTab("original")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTextTab === "original"
                      ? "bg-white dark:bg-gray-700 text-slate-800 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  Versi Awal
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-gray-800/50 border border-slate-200/50 dark:border-gray-700/60 font-inter text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto">
              {activeTextTab === "revised" ? revisionResult.revisedText : revisionResult.originalText}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => {
                setRevisedEssay(revisionResult.revisedText);
                setRevisionResult(null);
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-hanken font-bold px-6 py-3.5 rounded-xl hover:shadow-lg transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined">edit_note</span>
              Lakukan Revisi Lanjutan
            </button>
            <button
              onClick={onCancel}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-hanken font-bold px-6 py-3.5 rounded-xl transition-all cursor-pointer"
            >
              Selesai & Tutup
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── REVISION WORKSPACE (SIDE-BY-SIDE) ────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-inter text-sm font-semibold cursor-pointer disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Batal & Kembali
        </button>
        <span className="text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-200/50 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">history_edu</span>
          Mode Revisi & Komparasi
        </span>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200/50 text-rose-700 dark:text-rose-300 text-xs font-inter flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Original Essay & Past AI Suggestions */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-150 dark:border-gray-700 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h3 className="font-hanken text-sm font-bold text-gray-900 dark:text-white">
                  Versi Awal Anda
                </h3>
              </div>
              <span className="font-mono text-xs text-slate-500 font-bold bg-slate-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
                Skor: {Math.round(submission.score)}/100
              </span>
            </div>

            {/* Original Essay Content */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-900/40 border border-slate-200/40 dark:border-gray-700/40 font-inter text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line max-h-72 overflow-y-auto">
              {submission.responseText || initialEssay}
            </div>

            {/* Suggestions Box */}
            <div className="pt-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 block mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">lightbulb</span>
                Target Perbaikan dari AI
              </span>
              <WritingFeedback feedback={submission.feedback} />
            </div>
          </div>
        </div>

        {/* Right Column: Revision Editor */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-850 rounded-3xl border-2 border-orange-500/40 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                <h3 className="font-hanken text-sm font-bold text-gray-900 dark:text-white">
                  Editor Revisi
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-xs font-bold ${
                    wordCount >= prompt.minWords ? "text-emerald-600" : "text-slate-400"
                  }`}
                >
                  {wordCount} / {prompt.minWords} kata
                </span>
                {wordCount >= prompt.minWords && (
                  <span className="material-symbols-outlined text-emerald-600 text-sm">
                    check_circle
                  </span>
                )}
              </div>
            </div>

            {isSubmitting ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center">
                <div className="w-12 h-12 border-3 border-orange-600 border-t-transparent rounded-full animate-spin" />
                <div className="space-y-1">
                  <h4 className="font-hanken text-sm font-bold text-slate-900 dark:text-white">
                    AI Sedang Menilai Revisi Anda...
                  </h4>
                  <p className="font-inter text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                    Membandingkan struktur, tata bahasa, dan kekayaan diksi dengan versi sebelumnya.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <textarea
                  value={revisedEssay}
                  onChange={(e) => setRevisedEssay(e.target.value)}
                  className="w-full min-h-[380px] p-5 rounded-2xl border border-slate-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-inter bg-slate-50/50 dark:bg-gray-800 text-gray-900 dark:text-white resize-none leading-relaxed text-xs sm:text-sm"
                  placeholder="Sunting dan poles kalimat Anda di sini berdasarkan feedback AI..."
                />

                <div className="flex items-center justify-between pt-2">
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    💡 Perbaiki tata bahasa, tingkatkan diksi formal, dan perjelas ide pokok.
                  </p>
                  <button
                    onClick={() => void handleRevisionSubmit()}
                    disabled={!isReadyToSubmit || isSubmitting}
                    className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-hanken font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0 text-xs sm:text-sm"
                  >
                    <span className="material-symbols-outlined text-base">send</span>
                    Kirim & Bandingkan
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
