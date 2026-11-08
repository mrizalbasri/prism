"use client";

import { useEffect, useState } from "react";
import ScoringRetryButton from "./ScoringRetryButton";

type Row = { id: string; resourceType: "WRITING" | "SPEAKING"; title: string };

export default function FailedPracticeScoring({ userId }: { userId?: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const url = "/api/admin/scoring/failed" + (userId ? "?userId=" + encodeURIComponent(userId) : "");
    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error("Request failed");
        const data = await response.json();
        if (!controller.signal.aborted) setRows(data.rows);
      } catch {
        if (!controller.signal.aborted) setError("Gagal memuat latihan yang perlu dinilai ulang.");
      }
    }
    void load();
    return () => controller.abort();
  }, [userId, revision]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h3 className="font-bold">Latihan yang perlu dinilai ulang</h3>
        <button type="button" className="text-sm text-blue-600" onClick={() => {
          setError("");
          setRevision(value => value + 1);
        }}>Muat ulang</button>
      </div>
      {error && <p role="alert">{error}</p>}
      {rows.map(row => (
        <div key={row.resourceType + row.id}>
          <p className="text-xs">Penilaian gagal: {row.title}</p>
          <ScoringRetryButton resourceType={row.resourceType} resourceId={row.id} onAccepted={() => {
            setRows(previous => previous.filter(item => item.id !== row.id || item.resourceType !== row.resourceType));
          }} />
        </div>
      ))}
    </div>
  );
}
