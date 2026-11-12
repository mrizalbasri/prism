'use client';

import React from 'react';
import { type GrammarExercise, type ExerciseType } from '@/lib/grammar-exercises';

interface Props {
  exercise: Omit<GrammarExercise, 'correctAnswer'>;
  index: number;
  total: number;
  onAnswer: (exerciseId: string, answer: string) => void;
  result: { isCorrect: boolean; correctAnswer: string; explanation: string } | null;
  isLoading: boolean;
}

const TYPE_LABEL: Record<ExerciseType, string> = {
  fill_blank: 'Isi Bagian Kosong',
  error_correction: 'Koreksi Kesalahan',
  sentence_transform: 'Transformasi Kalimat',
};

const LEVEL_COLOR: Record<string, string> = {
  BEGINNER: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
  ADVANCED: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
};

export function GrammarExerciseCard({ exercise, index, total, onAnswer, result, isLoading }: Props) {
  const [selected, setSelected] = React.useState<string | null>(null);
  function handleSelect(option: string) {
    if (result || isLoading) return;
    setSelected(option);
    onAnswer(exercise.id, option);
  }

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-150 dark:border-gray-700 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${LEVEL_COLOR[exercise.level]}`}>
            {exercise.level}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
            {TYPE_LABEL[exercise.type]}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
            {exercise.topic}
          </span>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
          {index + 1} / {total}
        </span>
      </div>

      {/* Question */}
      <p className="font-inter text-base text-gray-800 dark:text-gray-100 whitespace-pre-line leading-relaxed">
        {exercise.questionText}
      </p>

      {/* Options */}
      {exercise.options && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {exercise.options.map((opt, i) => {
            const isSelected = selected === opt;
            const isAnswer = result?.correctAnswer === opt;
            const isWrong = isSelected && result && !result.isCorrect;

            let cls =
              'flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl border text-sm font-inter transition-all ';

            if (!result && !isLoading) {
              cls += isSelected
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 cursor-pointer';
            } else if (isAnswer) {
              cls += 'border-green-500 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300';
            } else if (isWrong) {
              cls += 'border-red-400 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400';
            } else {
              cls += 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 opacity-60';
            }

            return (
              <button key={opt} className={cls} onClick={() => handleSelect(opt)} disabled={!!result || isLoading}>
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold shrink-0">
                  {optionLabels[i]}
                </span>
                <span>{opt}</span>
                {isAnswer && result && (
                  <span className="material-symbols-outlined text-green-500 ml-auto text-base">check_circle</span>
                )}
                {isWrong && (
                  <span className="material-symbols-outlined text-red-400 ml-auto text-base">cancel</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          Memeriksa jawaban...
        </div>
      )}

      {/* Explanation */}
      {result && (
        <div
          className={`rounded-xl p-4 border ${
            result.isCorrect
              ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20'
              : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className={`material-symbols-outlined text-lg ${result.isCorrect ? 'text-green-600' : 'text-amber-600'}`}>
              {result.isCorrect ? 'check_circle' : 'lightbulb'}
            </span>
            <span className={`font-hanken font-bold text-sm ${result.isCorrect ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
              {result.isCorrect ? 'Jawaban Benar!' : `Jawaban Salah — Yang benar: ${result.correctAnswer}`}
            </span>
          </div>
          <p className="font-inter text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {result.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
