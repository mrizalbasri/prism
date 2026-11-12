import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  user: vi.fn(),
  submission: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  revision: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  learningSession: {
    create: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
  transaction: vi.fn(),
  scoreWritingWithAI: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUserFromRequest: mocks.user,
  createAuditLog: mocks.auditLog.create,
}));

vi.mock("@/lib/scoring", () => ({
  scoreWritingWithAI: mocks.scoreWritingWithAI,
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    writingSubmission: {
      findFirst: mocks.submission.findFirst,
      update: mocks.submission.update,
    },
    writingRevision: {
      findFirst: mocks.revision.findFirst,
      create: mocks.revision.create,
    },
    learningSession: {
      create: mocks.learningSession.create,
    },
    auditLog: {
      create: mocks.auditLog.create,
    },
    $transaction: mocks.transaction,
  },
}));

import { POST } from "@/app/api/writing/revise/route";

describe("POST /api/writing/revise", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthorized", async () => {
    mocks.user.mockResolvedValue(null);
    const req = new NextRequest("http://localhost:3000/api/writing/revise", {
      method: "POST",
      body: JSON.stringify({ submissionId: "sub-1", essay: "Revised essay text." }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 403 when user lacks module access", async () => {
    mocks.user.mockResolvedValue({ id: "user-1", role: "STUDENT", hasModuleAccess: false });
    const req = new NextRequest("http://localhost:3000/api/writing/revise", {
      method: "POST",
      body: JSON.stringify({ submissionId: "sub-1", essay: "Revised essay text." }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("returns 400 when missing required fields", async () => {
    mocks.user.mockResolvedValue({ id: "user-1", role: "STUDENT", hasModuleAccess: true });
    const req = new NextRequest("http://localhost:3000/api/writing/revise", {
      method: "POST",
      body: JSON.stringify({ submissionId: "", essay: "" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 404 when target submission is not found", async () => {
    mocks.user.mockResolvedValue({ id: "user-1", role: "STUDENT", hasModuleAccess: true });
    mocks.submission.findFirst.mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/writing/revise", {
      method: "POST",
      body: JSON.stringify({ submissionId: "missing-sub", essay: "Some revised text here." }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("returns 429 when submitted within cooldown period", async () => {
    mocks.user.mockResolvedValue({ id: "user-1", role: "STUDENT", hasModuleAccess: true });
    mocks.submission.findFirst.mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      prompt: { promptText: "Write essay", rubric: null },
    });
    mocks.revision.findFirst.mockResolvedValue({
      createdAt: new Date(), // Just now
    });

    const req = new NextRequest("http://localhost:3000/api/writing/revise", {
      method: "POST",
      body: JSON.stringify({ submissionId: "sub-1", essay: "Some revised text here." }),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it("evaluates revision and returns score comparisons with deltas", async () => {
    mocks.user.mockResolvedValue({ id: "user-1", role: "STUDENT", hasModuleAccess: true });
    mocks.submission.findFirst.mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      responseText: "Original flawed essay.",
      overallScore: 60,
      grammarScore: 50,
      clarityScore: 65,
      structureScore: 65,
      prompt: { promptText: "Write essay", rubric: null },
    });
    mocks.revision.findFirst.mockResolvedValue(null);

    mocks.scoreWritingWithAI.mockResolvedValue({
      score: 82,
      feedback: {
        grammarScore: 80,
        clarityScore: 85,
        structureScore: 80,
        grammar: "Improved past tenses.",
        suggestions: ["Good progress!"],
      },
    });

    const createdRevision = {
      id: "rev-1",
      writingSubmissionId: "sub-1",
      responseText: "Polished and well-written revised essay.",
      wordCount: 6,
      overallScore: 82,
      grammarScore: 80,
      clarityScore: 85,
      structureScore: 80,
      createdAt: new Date("2026-06-01T12:00:00Z"),
    };

    mocks.transaction.mockResolvedValue([createdRevision, { id: "sub-1", revisionCount: 1 }]);

    const req = new NextRequest("http://localhost:3000/api/writing/revise", {
      method: "POST",
      body: JSON.stringify({
        submissionId: "sub-1",
        essay: "Polished and well-written revised essay.",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.revision.id).toBe("rev-1");
    expect(body.revision.scores.overall).toBe(82);
    expect(body.revision.originalScores.overall).toBe(60);
    expect(body.revision.delta.overall).toBe(22);
    expect(body.revision.delta.grammar).toBe(30);
    expect(body.revision.delta.clarity).toBe(20);
    expect(body.revision.delta.structure).toBe(15);
  });
});
