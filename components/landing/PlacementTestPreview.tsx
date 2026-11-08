"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";

const OPTIONS = ["Scarce", "Plentiful", "Minimal"];

export default function PlacementTestPreview() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="placement-preview">
      <div className="preview-heading">
        <span className="landing-eyebrow">VOCABULARY</span>
        <span>Contoh soal</span>
      </div>
      <h3>Choose the correct synonym for &quot;abundant&quot;.</h3>
      <p className="preview-instruction">Pilih satu jawaban untuk melihat penjelasannya.</p>
      <div className="preview-options" role="group" aria-label="Pilihan jawaban">
        {OPTIONS.map((option, index) => (
          <button key={option} type="button" aria-pressed={selected === option}
            disabled={selected !== null} onClick={() => setSelected(option)}
            className={selected === option ? "is-selected" : ""}>
            <span>{String.fromCharCode(65 + index)}</span>
            {option}
            {selected === option && option === "Plentiful" && <Check size={18} aria-hidden="true" />}
          </button>
        ))}
      </div>
      <div aria-live="polite" aria-atomic="true">
        {selected !== null && (
          <div className="preview-feedback">
            <strong>{selected === "Plentiful" ? "Benar, plentiful!" : "Belum tepat. Jawabannya plentiful."}</strong>
            <p>&quot;Abundant&quot; dan &quot;plentiful&quot; berarti melimpah. &quot;Scarce&quot; berarti langka, sedangkan &quot;minimal&quot; berarti sangat sedikit.</p>
            <button type="button" onClick={() => setSelected(null)}>
              <RotateCcw size={14} aria-hidden="true" /> Coba lagi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
