import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import path from "path";
vi.mock("fs", () => ({ promises: { realpath: vi.fn(), stat: vi.fn(), readFile: vi.fn() } }));
import { promises as fs } from "fs";
import { readScoringAudio } from "@/lib/scoring-audio";
beforeEach(() => { vi.resetAllMocks(); vi.stubEnv("R2_PUBLIC_URL", "https://audio.invalid/media"); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe("audio boundary", () => {
  it("reads a bounded local audio recording", async () => { const root = path.join(process.cwd(), "public", "uploads", "audio"); vi.mocked(fs.realpath).mockResolvedValueOnce(root).mockResolvedValueOnce(path.join(root, "test.webm")); vi.mocked(fs.stat).mockResolvedValue({ size: 2, isFile: () => true } as Awaited<ReturnType<typeof fs.stat>>); vi.mocked(fs.readFile).mockResolvedValue(Buffer.from("ok")); expect(await readScoringAudio("/uploads/audio/test.webm")).toEqual({ data: "b2s=", mimeType: "audio/webm" }); });
  it("rejects traversal even when a file resolves outside uploads", async () => { vi.mocked(fs.realpath).mockResolvedValueOnce(path.join(process.cwd(), "public/uploads/audio")).mockResolvedValueOnce(path.join(process.cwd(), "secret.webm")); await expect(readScoringAudio("/uploads/audio/../../../secret.webm")).rejects.toThrow("denied"); });
  it("rejects missing local files", async () => { vi.mocked(fs.realpath).mockRejectedValue(new Error("missing")); await expect(readScoringAudio("/uploads/audio/missing.webm")).rejects.toThrow(); });
  it("reads allowed cloud audio with timeout and redirects disabled", async () => { const fetcher = vi.fn().mockResolvedValue(new Response("ok")); vi.stubGlobal("fetch", fetcher); expect((await readScoringAudio("https://audio.invalid/media/audio/test.mp3")).mimeType).toBe("audio/mpeg"); expect(fetcher.mock.calls[0][1]).toMatchObject({ redirect: "error", signal: expect.any(AbortSignal) }); });
  it.each(["https://evil.invalid/media/audio/test.webm", "https://audio.invalid/other/test.webm", "http://audio.invalid/media/audio/test.webm", "https://audio.invalid/media/audio/../test.webm"])("rejects unapproved URL %s", async url => { const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher); await expect(readScoringAudio(url)).rejects.toThrow(); expect(fetcher).not.toHaveBeenCalled(); });
  it("rejects an oversized cloud response", async () => { vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("ok", { headers: { "content-length": "10485761" } }))); await expect(readScoringAudio("https://audio.invalid/media/audio/test.webm")).rejects.toThrow("large"); });
  it("propagates cloud timeout", async () => { vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new DOMException("Timeout", "TimeoutError"))); await expect(readScoringAudio("https://audio.invalid/media/audio/test.webm")).rejects.toThrow("Timeout"); });
});
