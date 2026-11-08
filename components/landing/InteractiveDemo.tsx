"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, RotateCcw } from "lucide-react";

type Correction = {
  original: string;
  corrected: string;
  explanation: string;
  type: "grammar" | "tense" | "article" | "preposition" | "other";
};

type Sample = {
  text: string;
  correctedText: string;
  score: number;
  corrections: Correction[];
};

const SAMPLES: Record<string, Sample> = {
  "I has went to library yesterday for read book.": {
    text: "I has went to library yesterday for read book.",
    correctedText: "I went to the library yesterday to read a book.",
    score: 65,
    corrections: [
      {
        original: "has went",
        corrected: "went",
        explanation: "Gunakan simple past tense ('went') karena ada penanda waktu spesifik di masa lalu ('yesterday'). Selain itu, 'has went' secara tata bahasa tidak tepat (seharusnya 'has gone' jika present perfect).",
        type: "tense",
      },
      {
        original: "to library",
        corrected: "to the library",
        explanation: "Tambahkan kata sandang 'the' sebelum kata benda spesifik 'library' yang dapat dihitung (countable singular noun).",
        type: "article",
      },
      {
        original: "for read book",
        corrected: "to read a book",
        explanation: "Gunakan to-infinitive ('to read') untuk menyatakan tujuan aktivitas, dan tambahkan artikel 'a' sebelum kata benda tunggal 'book'.",
        type: "preposition",
      },
    ],
  },
  "He do not like apple because it are sour.": {
    text: "He do not like apple because it are sour.",
    correctedText: "He does not like apples because they are sour.",
    score: 70,
    corrections: [
      {
        original: "do not",
        corrected: "does not",
        explanation: "Gunakan kata kerja bantu 'does' untuk subjek orang ketiga tunggal (He/She/It).",
        type: "grammar",
      },
      {
        original: "like apple",
        corrected: "like apples",
        explanation: "Gunakan bentuk jamak 'apples' atau tambahkan artikel seperti 'an apple' jika merujuk buah secara umum.",
        type: "article",
      },
      {
        original: "it are",
        corrected: "they are",
        explanation: "Karena merujuk pada buah-buah apel (jamak) dari frasa sebelumnya, subjek harus diganti 'they' untuk berpasangan dengan to-be jamak 'are'. Jika merujuk tunggal, seharusnya 'it is'.",
        type: "grammar",
      },
    ],
  },
  "She is more taller than her sister.": {
    text: "She is more taller than her sister.",
    correctedText: "She is taller than her sister.",
    score: 85,
    corrections: [
      {
        original: "more taller",
        corrected: "taller",
        explanation: "Kata sifat bersuku kata satu seperti 'tall' mendapat akhiran '-er' (taller) untuk menyatakan komparatif. Menambahkan kata 'more' di depannya adalah pemubaziran kata (double comparative).",
        type: "grammar",
      },
    ],
  },
};

export default function InteractiveDemo() {
  const [selected, setSelected] = useState(Object.keys(SAMPLES)[0]);
  const [revealed, setRevealed] = useState(false);
  const sample = SAMPLES[selected];
  return (
    <div className="writing-demo">
      <div className="demo-heading"><strong>Writing Practice</strong><span>Simulasi</span></div>
      <p id="demo-help" className="demo-help">Pilih contoh untuk melihat cara koreksi dijelaskan. Demo ini memakai hasil yang telah disiapkan.</p>
      <fieldset aria-describedby="demo-help">
        <legend>Pilih contoh kalimat</legend>
        {Object.keys(SAMPLES).map((text, index) => (
          <label className="demo-option" key={text}>
            <input type="radio" name="writing-example" value={text} checked={selected === text} onChange={() => { setSelected(text); setRevealed(false); }} />
            <span><small>CONTOH 0{index + 1}</small>{text}</span>
          </label>
        ))}
      </fieldset>
      <button type="button" className="landing-button primary demo-reveal" onClick={() => setRevealed(!revealed)}>{revealed ? "Tutup Koreksi" : "Lihat Koreksi"}{revealed ? <RotateCcw size={16} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}</button>
      <div aria-live="polite" aria-atomic="true">
        {revealed && <div className="demo-result">
          <h3><Check size={18} aria-hidden="true" /> Kalimat yang diperbaiki</h3>
          <p className="demo-corrected">{sample.correctedText}</p>
          <ul>{sample.corrections.map((correction) => <li key={correction.original}><strong>{correction.original} <ArrowRight size={13} aria-hidden="true" /> {correction.corrected}</strong><p>{correction.explanation}</p></li>)}</ul>
        </div>}
      </div>
      <p className="demo-signup">Ingin umpan balik untuk tulisanmu sendiri? <Link href="/register">Mulai belajar di PRISM<ArrowRight size={14} aria-hidden="true" /></Link></p>
    </div>
  );
}
