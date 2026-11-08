"use client";

import { useState } from "react";

type Props = {
  resourceType: "TEST" | "WRITING" | "SPEAKING";
  resourceId: string;
  onAccepted?: () => void;
};

export default function ScoringRetryButton({ resourceType, resourceId, onAccepted }: Props) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function retry() {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/scoring/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceType, resourceId }),
      });
      if (!response.ok) throw new Error("Penilaian tidak dapat diulang. Muat ulang untuk melihat status terbaru.");
      setMessage("Penilaian ulang dijadwalkan.");
      onAccepted?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menghubungi server.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button type="button" disabled={busy} onClick={retry}
        className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
        {busy ? "Penilaian dijadwalkan" : "Ulangi penilaian"}
      </button>
      {message && <p role="status" className="text-sm">{message}</p>}
    </div>
  );
}
