'use client';

import React from 'react';
import type { GrammarLevel } from '@/lib/grammar-exercises';

interface Props {
  activeLevel: GrammarLevel | null;
  onSelect: (level: GrammarLevel | null) => void;
  counts: Record<GrammarLevel, number>;
}

const LEVELS: { value: GrammarLevel; label: string; icon: string; color: string }[] = [
  { value: 'BEGINNER', label: 'Pemula', icon: 'electric_bolt', color: 'text-green-600 dark:text-green-400' },
  { value: 'INTERMEDIATE', label: 'Menengah', icon: 'trending_up', color: 'text-yellow-600 dark:text-yellow-400' },
  { value: 'ADVANCED', label: 'Lanjutan', icon: 'military_tech', color: 'text-red-600 dark:text-red-400' },
];

export function GrammarLevelFilter({ activeLevel, onSelect, counts }: Props) {
  return (
    <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-150 dark:border-gray-700 p-5 space-y-3">
      <h3 className="font-hanken font-bold text-sm text-gray-700 dark:text-gray-200">
        Filter Level
      </h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelect(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            activeLevel === null
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-400'
          }`}
        >
          Semua ({Object.values(counts).reduce((a, b) => a + b, 0)})
        </button>
        {LEVELS.map((l) => (
          <button
            key={l.value}
            onClick={() => onSelect(l.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              activeLevel === l.value
                ? 'bg-blue-600 text-white border-blue-600'
                : `border-gray-200 dark:border-gray-700 ${l.color} hover:border-blue-400`
            }`}
          >
            <span className="material-symbols-outlined text-sm">{l.icon}</span>
            {l.label} ({counts[l.value]})
          </button>
        ))}
      </div>
    </div>
  );
}
