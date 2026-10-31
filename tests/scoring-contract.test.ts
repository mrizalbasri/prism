import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
vi.mock("@/lib/scoring-audio", () => ({ readScoringAudio: vi.fn() }));
import { parseAiJson, scoreWritingWithAI, scoreSpeakingWithAI } from "@/lib/scoring";
import { readScoringAudio } from "@/lib/scoring-audio";
beforeEach(() => { vi.stubEnv("MINIMAX_API_KEY", "test"); vi.stubEnv("GEMINI_API_KEY", "test"); vi.stubEnv("GEMINI_BASE_URL", "https://proxy.invalid"); vi.clearAllMocks(); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe("AI scoring contract", () => {
  it.each(['plain text', '{broken}', '{}', '{"score":"70"}', '{"score":null}', '{"score":-1}', '{"score":101}', '{"score":NaN}', '{"score":80,"grammarScore":null}', '{"score":80,"feedback":{"fluencyScore":200}}'])("rejects invalid scores: %s", text => { expect(() => parseAiJson(text)).toThrow(); });
  it("accepts actual zero and optional component scores", () => { expect(parseAiJson('{"score":0,"grammarScore":20,"feedback":{}}')).toEqual({ score: 0, feedback: { grammarScore: 20 } }); });
  it("falls back to the alternate provider when the first response is invalid", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ choices: [{ message: { content: "invalid" } }] }))).mockResolvedValueOnce(new Response(JSON.stringify({ choices: [{ message: { content: '{"score":82}' } }] })));
    vi.stubGlobal("fetch", fetcher);
    expect((await scoreWritingWithAI("Essay", "Prompt")).score).toBe(82); expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it("throws instead of grading text length when all providers fail", async () => { vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("provider down"))); await expect(scoreWritingWithAI("word ".repeat(150), "Prompt")).rejects.toThrow("Penilaian AI gagal"); });
  it("does not send audio placeholders to a text provider", async () => { vi.stubEnv("GEMINI_API_KEY", ""); vi.mocked(readScoringAudio).mockResolvedValue({ data: "YQ==", mimeType: "audio/webm" }); const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher); await expect(scoreSpeakingWithAI("(Audio recording submitted)", "Prompt", null, "/uploads/audio/test.webm")).rejects.toThrow(); expect(fetcher).not.toHaveBeenCalled(); });
  it("does not fabricate pronunciation from text", async () => { vi.stubEnv("GEMINI_API_KEY", ""); vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: '{"score":80,"pronunciationScore":90}' } }] })))); expect((await scoreSpeakingWithAI("I study English", "Prompt")).feedback.pronunciationScore).toBeUndefined(); });
  it("fails when a submitted audio recording cannot be read", async () => { vi.mocked(readScoringAudio).mockRejectedValue(new Error("missing")); await expect(scoreSpeakingWithAI("Valid transcript", "Prompt", null, "/uploads/audio/missing.webm")).rejects.toThrow("missing"); });
});
