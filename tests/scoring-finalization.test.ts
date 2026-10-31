import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ attempt: vi.fn(), result: vi.fn(), update: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ default: { testAttempt: { findUnique: mocks.attempt }, finalResult: { upsert: mocks.result }, sectionAttempt: { update: mocks.update } } }));
import { finalizeTestResults } from "@/lib/scoring";
beforeEach(() => vi.resetAllMocks());
describe("finalization gate", () => {
  it("refuses a submitted but unvalidated writing response", async () => { mocks.attempt.mockResolvedValue({ userId: "student", sectionAttempts: [{ writingResponse: { content: "Essay", feedback: null } }] }); await expect(finalizeTestResults("test")).rejects.toThrow("unscored"); expect(mocks.result).not.toHaveBeenCalled(); expect(mocks.update).not.toHaveBeenCalled(); });
  it("refuses unvalidated audio even with a placeholder transcript", async () => { mocks.attempt.mockResolvedValue({ userId: "student", sectionAttempts: [{ speakingResponse: { audioUrl: "/uploads/audio/recording.webm", transcript: "(Audio recording submitted)", feedback: {} } }] }); await expect(finalizeTestResults("test")).rejects.toThrow("unscored"); expect(mocks.result).not.toHaveBeenCalled(); });
});
