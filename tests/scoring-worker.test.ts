import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ process: vi.fn(), fail: vi.fn(), handler: undefined as undefined | ((job: { data: unknown; attemptsMade: number; opts: { attempts: number } }) => Promise<void>) }));
vi.mock("bullmq", () => ({ Worker: class { constructor(_name: string, callback: typeof mocks.handler) { mocks.handler = callback; } on() {} } }));
vi.mock("@/lib/queue", () => ({ getRedisConnection: () => ({}) }));
vi.mock("@/lib/ai-scoring-processor", () => ({ processAIScoring: mocks.process, markScoringFailed: mocks.fail }));
import "@/workers/ai-evaluation.worker";
beforeEach(() => { mocks.process.mockReset(); mocks.fail.mockReset(); });
describe("worker retry lifecycle", () => {
  it("retains processing before the final attempt", async () => { mocks.process.mockRejectedValue(new Error("down")); await expect(mocks.handler!({ data: { type: "TEST_SCORING", testAttemptId: "test" }, attemptsMade: 0, opts: { attempts: 3 } })).rejects.toThrow(); expect(mocks.fail).not.toHaveBeenCalled(); });
  it("marks failed after the final attempt", async () => { const data = { type: "TEST_SCORING", testAttemptId: "test" }; mocks.process.mockRejectedValue(new Error("down")); await expect(mocks.handler!({ data, attemptsMade: 2, opts: { attempts: 3 } })).rejects.toThrow(); expect(mocks.fail).toHaveBeenCalledWith(data); });
  it("uses the shared processor for successful jobs", async () => { const data = { type: "TEST_SCORING", testAttemptId: "test" }; await mocks.handler!({ data, attemptsMade: 0, opts: { attempts: 3 } }); expect(mocks.process).toHaveBeenCalledWith(data); expect(mocks.fail).not.toHaveBeenCalled(); });
});
