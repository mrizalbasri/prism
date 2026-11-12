'use client';

import React from 'react';
import { GrammarExerciseCard } from '@/components/student/grammar/GrammarExerciseCard';
import { GrammarProgressBar } from '@/components/student/grammar/GrammarProgressBar';
import { GrammarLevelFilter } from '@/components/student/grammar/GrammarLevelFilter';
import type { GrammarExercise, GrammarLevel } from '@/lib/grammar-exercises';

type ExerciseNoAnswer = Omit<GrammarExercise, 'correctAnswer'>;
type CheckResult = { isCorrect: boolean; correctAnswer: string; explanation: string };

export default function GrammarPracticePage() {
  const [exercises, setExercises] = React.useState<ExerciseNoAnswer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [activeLevel, setActiveLevel] = React.useState<GrammarLevel | null>(null);
  const [currentIdx, setCurrentIdx] = React.useState(0);

  // Map exerciseId → check result
  const [results, setResults] = React.useState<Record<string, CheckResult>>({});
  const [checking, setChecking] = React.useState(false);

  const [sessionDone, setSessionDone] = React.useState(false);

  async function fetchExercises(level: GrammarLevel | null) {
    setLoading(true);
    setError(null);
    setCurrentIdx(0);
    setResults({});
    setSessionDone(false);
    try {
      const qs = level ? `?level=${level}` : '';
      const res = await fetch(`/api/grammar/exercises${qs}`);
      if (!res.ok) throw new Error('Gagal memuat soal');
      const data = await res.json();
      setExercises(data.exercises);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchExercises(activeLevel);
  }, [activeLevel]);

  async function handleAnswer(exerciseId: string, answer: string) {
    setChecking(true);
    try {
      const res = await fetch('/api/grammar/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId, answer }),
      });
      if (!res.ok) throw new Error();
      const data: CheckResult = await res.json();
      setResults((prev) => ({ ...prev, [exerciseId]: data }));
    } catch {
      // If check fails, don't block UX — user can retry
    } finally {
      setChecking(false);
    }
  }

  function handleNext() {
    if (currentIdx + 1 >= exercises.length) {
      setSessionDone(true);
    } else {
      setCurrentIdx((i) => i + 1);
    }
  }

  function handleRestart() {
    setCurrentIdx(0);
    setResults({});
    setSessionDone(false);
  }

  const answered = Object.keys(results).length;
  const correct = Object.values(results).filter((r) => r.isCorrect).length;
  const currentExercise = exercises[currentIdx];
  const currentResult = currentExercise ? results[currentExercise.id] ?? null : null;

  // Level counts (all exercises regardless of filter — from initial full load)
  const counts: Record<GrammarLevel, number> = { BEGINNER: 5, INTERMEDIATE: 5, ADVANCED: 5 };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <span className="material-symbols-outlined">spellcheck</span>
            <span className="font-hanken font-bold text-sm uppercase tracking-widest">Grammar Practice</span>
          </div>
          <h1 className="font-hanken text-3xl font-bold text-gray-900 dark:text-white">
            Latihan Grammar
          </h1>
          <p className="font-inter text-sm text-gray-500 dark:text-gray-400">
            Kuasai tata bahasa Inggris dengan soal pilihan ganda, koreksi kesalahan, dan transformasi kalimat.
          </p>
        </div>

        {/* Level Filter */}
        <GrammarLevelFilter
          activeLevel={activeLevel}
          onSelect={(l) => setActiveLevel(l)}
          counts={counts}
        />

        {/* Progress */}
        {!loading && exercises.length > 0 && (
          <GrammarProgressBar current={answered} total={exercises.length} correct={correct} />
        )}

        {/* States */}
        {loading && (
          <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-150 dark:border-gray-700 p-10 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 font-inter">Memuat soal...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-6 text-center space-y-3">
            <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
            <p className="text-sm text-red-600 dark:text-red-400 font-inter">{error}</p>
            <button
              onClick={() => fetchExercises(activeLevel)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Session Complete */}
        {sessionDone && !loading && (
          <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-150 dark:border-gray-700 p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-blue-600 text-3xl">emoji_events</span>
            </div>
            <div>
              <h2 className="font-hanken text-xl font-bold text-gray-900 dark:text-white">
                Sesi Selesai!
              </h2>
              <p className="font-inter text-sm text-gray-500 dark:text-gray-400 mt-1">
                Kamu menjawab {correct} dari {exercises.length} soal dengan benar
              </p>
            </div>

            {/* Score badge */}
            <div
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-full font-hanken font-bold text-2xl ${
                correct / exercises.length >= 0.8
                  ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400'
                  : correct / exercises.length >= 0.5
                  ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                  : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
              }`}
            >
              {Math.round((correct / exercises.length) * 100)}%
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={handleRestart}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Ulangi Sesi
              </button>
              <button
                onClick={() => setActiveLevel(activeLevel === 'ADVANCED' ? null : activeLevel === 'INTERMEDIATE' ? 'ADVANCED' : 'INTERMEDIATE')}
                className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-semibold hover:border-blue-400 transition-colors"
              >
                Coba Level Lain
              </button>
            </div>
          </div>
        )}

        {/* Exercise Card */}
        {!loading && !error && !sessionDone && currentExercise && (
          <>
            <GrammarExerciseCard
              key={currentExercise.id}
              exercise={currentExercise}
              index={currentIdx}
              total={exercises.length}
              onAnswer={handleAnswer}
              result={currentResult}
              isLoading={checking}
            />

            {/* Next button — only after answer checked */}
            {currentResult && (
              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-hanken font-semibold text-sm hover:bg-blue-700 transition-colors"
                >
                  {currentIdx + 1 >= exercises.length ? 'Lihat Hasil' : 'Soal Berikutnya'}
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
