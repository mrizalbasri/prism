'use client';

import React from 'react';

interface Props {
  current: number;
  total: number;
  correct: number;
}

export function GrammarProgressBar({ current, total, correct }: Props) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  const accuracy = current > 0 ? Math.round((correct / current) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-150 dark:border-gray-700 p-5 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-hanken font-semibold text-gray-700 dark:text-gray-200">
          Progress Sesi
        </span>
        <span className="font-mono text-gray-400 dark:text-gray-500">
          {current}/{total} soal
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs font-inter">
        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          <span>{correct} benar</span>
        </div>
        <div className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
          <span className="material-symbols-outlined text-sm">cancel</span>
          <span>{current - correct} salah</span>
        </div>
        {current > 0 && (
          <div className="ml-auto font-bold text-gray-500 dark:text-gray-400">
            Akurasi {accuracy}%
          </div>
        )}
      </div>
    </div>
  );
}
