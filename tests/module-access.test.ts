import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), audit: vi.fn() }));
vi.mock("@/lib/auth", () => ({ getCurrentUserFromRequest: mocks.auth, createAuditLog: mocks.audit }));
import { POST as writing } from "@/app/api/writing/submit/route";
import { POST as speaking } from "@/app/api/speaking/submit/route";
import { POST as vocabulary, PATCH as endVocabulary } from "@/app/api/vocabulary/session/route";
import { POST as review, GET as reviewCards } from "@/app/api/vocabulary/review/route";
import { GET as writingHistory } from "@/app/api/writing/submissions/route";
import { GET as speakingHistory } from "@/app/api/speaking/sessions/route";
import { GET as cards } from "@/app/api/vocabulary/cards/route";
import { GET as prompts } from "@/app/api/writing/prompts/route";
import { GET as scenarios } from "@/app/api/speaking/scenarios/route";
beforeEach(() => vi.clearAllMocks());
describe("module submission access", () => {
  it.each([writing, speaking, vocabulary, endVocabulary, review, reviewCards, writingHistory, speakingHistory, cards, prompts, scenarios])("rejects students without module access before any work", async handler => { mocks.auth.mockResolvedValue({ id: "student", role: "STUDENT", hasModuleAccess: false }); expect((await handler(new NextRequest("http://localhost", { method: "POST" }))).status).toBe(403); });
  it.each([writing, speaking, vocabulary, endVocabulary, review, reviewCards, writingHistory, speakingHistory, cards, prompts, scenarios])("requires student role", async handler => { mocks.auth.mockResolvedValue({ id: "admin", role: "ADMIN", hasModuleAccess: true }); expect((await handler(new NextRequest("http://localhost", { method: "POST" }))).status).toBe(403); });
});
